import { NextRequest } from 'next/server';
import { POST as registerHandler } from '../app/api/auth/register/route';
import { POST as loginHandler } from '../app/api/auth/login/route';
import { GET as meHandler } from '../app/api/auth/me/route';
import { GET as statsHandler } from '../app/api/admin/stats/route';
import { GET as getProblemsHandler, POST as createProblemHandler } from '../app/api/admin/problems/route';
import { PUT as updateProblemHandler, DELETE as deleteProblemHandler } from '../app/api/admin/problems/[id]/route';
import { GET as getUsersHandler } from '../app/api/admin/users/route';
import { PATCH as updateUserRoleHandler } from '../app/api/admin/users/[id]/route';
import { prisma } from '../lib/prisma';
import { hashPassword, comparePassword, signToken, verifyToken } from '../lib/auth';

async function runTests() {
  console.log('====================================================');
  console.log('   CodeForge AI - Milestone 3 Verification Suite   ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  ✓ PASSED: ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ FAILED: ${testName}`);
      if (detail) console.error(`    Detail: ${detail}`);
      failed++;
    }
  }

  try {
    // ----------------------------------------------------
    // TEST 1: Password Hashing & JWT Utilities in lib/auth.ts
    // ----------------------------------------------------
    console.log('--- Test Group 1: Auth Utility Helpers (lib/auth.ts) ---');
    const rawPass = 'Secret123!';
    const hashed = await hashPassword(rawPass);
    assert(hashed !== rawPass && hashed.length > 20, 'hashPassword produces bcrypt hash');

    const isValidPass = await comparePassword(rawPass, hashed);
    assert(isValidPass, 'comparePassword verifies correct password');

    const isInvalidPass = await comparePassword('WrongPass', hashed);
    assert(!isInvalidPass, 'comparePassword rejects incorrect password');

    const testPayload = { id: 'test-id-123', email: 'test@example.com', name: 'Test User', role: 'REGISTERED' };
    const token = signToken(testPayload);
    assert(typeof token === 'string' && token.length > 10, 'signToken generates JWT string');

    const decoded = verifyToken(token);
    assert(decoded?.id === 'test-id-123' && decoded?.role === 'REGISTERED', 'verifyToken decodes valid JWT token');
    console.log('');

    // ----------------------------------------------------
    // TEST 2: User Registration (POST /api/auth/register)
    // ----------------------------------------------------
    console.log('--- Test Group 2: User Registration API ---');
    const timestamp = Date.now();
    const normalEmail = `user_${timestamp}@example.com`;
    const adminEmail = `admin_${timestamp}@admin.codeforge.ai`;

    // 2a. Register Normal User
    const regReqNormal = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email: normalEmail, name: 'Normal User', password: 'Password123' }),
    });
    const regResNormal = await registerHandler(regReqNormal);
    const regDataNormal = await regResNormal.json();

    assert(regResNormal.status === 201, 'Normal user registration returns HTTP 201');
    assert(regDataNormal.user?.role === 'REGISTERED', 'Normal user role is REGISTERED');
    assert(Boolean(regDataNormal.token), 'Registration returns JWT token');

    // 2b. Register Admin User (admin domain)
    const regReqAdmin = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email: adminEmail, name: 'Admin User', password: 'AdminPassword123' }),
    });
    const regResAdmin = await registerHandler(regReqAdmin);
    const regDataAdmin = await regResAdmin.json();

    assert(regResAdmin.status === 201, 'Admin user registration returns HTTP 201');
    assert(regDataAdmin.user?.role === 'ADMIN', 'Admin domain user role is ADMIN');
    console.log('');

    // ----------------------------------------------------
    // TEST 3: User Login (POST /api/auth/login)
    // ----------------------------------------------------
    console.log('--- Test Group 3: User Login API ---');
    const loginReq = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: normalEmail, password: 'Password123' }),
    });
    const loginRes = await loginHandler(loginReq);
    const loginData = await loginRes.json();

    assert(loginRes.status === 200, 'Login with valid credentials returns HTTP 200');
    assert(loginData.user?.email === normalEmail, 'Login returns matching user profile');
    assert(Boolean(loginData.token), 'Login returns JWT token');

    const invalidLoginReq = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: normalEmail, password: 'WrongPassword' }),
    });
    const invalidLoginRes = await loginHandler(invalidLoginReq);
    assert(invalidLoginRes.status === 401, 'Login with wrong password returns HTTP 401');
    console.log('');

    // ----------------------------------------------------
    // TEST 4: Profile Verification (GET /api/auth/me)
    // ----------------------------------------------------
    console.log('--- Test Group 4: Profile Verification API (GET /api/auth/me) ---');
    const userToken = loginData.token;
    const meReq = new NextRequest('http://localhost:3000/api/auth/me', {
      method: 'GET',
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const meRes = await meHandler(meReq);
    const meData = await meRes.json();

    assert(meRes.status === 200, 'GET /api/auth/me with Bearer token returns HTTP 200');
    assert(meData.user?.email === normalEmail, 'Profile returns expected email');
    console.log('');

    // ----------------------------------------------------
    // TEST 5: Admin Role Enforcement & Admin Stats
    // ----------------------------------------------------
    console.log('--- Test Group 5: Admin Authorization & Stats API ---');
    const adminToken = regDataAdmin.token;

    // 5a. Access /api/admin/stats as non-admin (Should fail 403)
    const statsForbiddenReq = new NextRequest('http://localhost:3000/api/admin/stats', {
      method: 'GET',
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const statsForbiddenRes = await statsHandler(statsForbiddenReq);
    assert(statsForbiddenRes.status === 403, 'Non-admin requesting /api/admin/stats gets HTTP 403 Forbidden');

    // 5b. Access /api/admin/stats as admin (Should succeed 200)
    const statsAdminReq = new NextRequest('http://localhost:3000/api/admin/stats', {
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const statsAdminRes = await statsHandler(statsAdminReq);
    const statsData = await statsAdminRes.json();

    assert(statsAdminRes.status === 200, 'Admin requesting /api/admin/stats gets HTTP 200 OK');
    assert(typeof statsData.totalUsers === 'number', 'Stats returns totalUsers count');
    assert(typeof statsData.totalProblems === 'number', 'Stats returns totalProblems count');
    console.log('');

    // ----------------------------------------------------
    // TEST 6: Admin Problem CRUD API
    // ----------------------------------------------------
    console.log('--- Test Group 6: Admin Problem CRUD API ---');
    const testProblemSlug = `test-problem-${timestamp}`;

    // 6a. Create Problem
    const createProbReq = new NextRequest('http://localhost:3000/api/admin/problems', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: `Test Problem ${timestamp}`,
        slug: testProblemSlug,
        statement: 'Given two integers A and B, print their sum.',
        inputFormat: 'Single line with two space separated integers.',
        outputFormat: 'Single integer sum.',
        constraints: '1 <= A, B <= 10^9',
        difficulty: 'EASY',
        topicTags: ['Math', 'Implementation'],
        companyTags: ['TestCorp'],
        editorial: 'Simply compute A + B.',
        timeLimit: 1.0,
        memoryLimit: 256,
        sampleTestCases: [{ input: '3 5\n', expectedOutput: '8', explanation: '3 + 5 = 8' }],
        hiddenTestCases: [{ input: '100 200\n', expectedOutput: '300' }],
        codeTemplates: [{ language: 'python', code: 'import sys\nprint(sum(map(int, sys.stdin.read().split())))' }],
      }),
    });

    const createProbRes = await createProblemHandler(createProbReq);
    const createProbData = await createProbRes.json();

    assert(createProbRes.status === 201, 'POST /api/admin/problems creates problem with HTTP 201');
    assert(createProbData.slug === testProblemSlug, 'Created problem slug matches');
    assert(createProbData.testCases?.length === 2, 'Test cases saved correctly');
    const createdProblemId = createProbData.id;

    // 6b. Update Problem
    const updateProbReq = new NextRequest(`http://localhost:3000/api/admin/problems/${createdProblemId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: `Updated Test Problem ${timestamp}`,
        difficulty: 'MEDIUM',
      }),
    });
    const updateProbRes = await updateProblemHandler(updateProbReq, { params: { id: createdProblemId } });
    const updateProbData = await updateProbRes.json();

    assert(updateProbRes.status === 200, 'PUT /api/admin/problems/[id] updates problem with HTTP 200');
    assert(updateProbData.title === `Updated Test Problem ${timestamp}`, 'Updated title matches');
    assert(updateProbData.difficulty === 'MEDIUM', 'Updated difficulty matches');

    // 6c. Delete Problem
    const deleteProbReq = new NextRequest(`http://localhost:3000/api/admin/problems/${createdProblemId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const deleteProbRes = await deleteProblemHandler(deleteProbReq, { params: { id: createdProblemId } });
    const deleteProbData = await deleteProbRes.json();

    assert(deleteProbRes.status === 200, 'DELETE /api/admin/problems/[id] deletes problem with HTTP 200');
    assert(deleteProbData.success === true, 'Delete response contains success flag');
    console.log('');

    // ----------------------------------------------------
    // TEST 7: Admin User Management API
    // ----------------------------------------------------
    console.log('--- Test Group 7: Admin User Management API ---');
    const getUsersReq = new NextRequest('http://localhost:3000/api/admin/users', {
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const getUsersRes = await getUsersHandler(getUsersReq);
    const getUsersData = await getUsersRes.json();

    assert(getUsersRes.status === 200, 'GET /api/admin/users returns HTTP 200');
    assert(Array.isArray(getUsersData) && getUsersData.length > 0, 'Users list returned');

    // Update normal user's role to ADMIN
    const normalUserId = regDataNormal.user.id;
    const patchRoleReq = new NextRequest(`http://localhost:3000/api/admin/users/${normalUserId}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'ADMIN' }),
    });
    const patchRoleRes = await updateUserRoleHandler(patchRoleReq, { params: { id: normalUserId } });
    const patchRoleData = await patchRoleRes.json();

    assert(patchRoleRes.status === 200, 'PATCH /api/admin/users/[id] updates user role with HTTP 200');
    assert(patchRoleData.user?.role === 'ADMIN', 'User role updated to ADMIN');
    console.log('');

    // ----------------------------------------------------
    // Cleanup & Summary
    // ----------------------------------------------------
    // Clean up created test users from DB
    await prisma.user.deleteMany({
      where: { email: { in: [normalEmail, adminEmail] } },
    });

    console.log('====================================================');
    console.log(` Verification Summary: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================\n');

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (error) {
    console.error('Fatal error running verification script:', error);
    process.exit(1);
  }
}

runTests();
