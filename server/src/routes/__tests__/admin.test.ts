/**
 * For testing auth.controller.ts and auth.middleware.ts
 */
import express from "express";
import request from "supertest";
import { Server } from "http";
import MongoStore from "connect-mongo";
import MongoConnection from "../../config/mongoConnection";
import createExpressApp from "../../config/createExpressApp";
import StatusCode from "../../util/statusCode";
import { User } from "../../models/user.model";
import Session from "../../models/session.model";

let dbConnection: MongoConnection;
let sessionStore: MongoStore;
let app: express.Express;
let server: Server;
let agent: request.SuperAgentTest;

const cleanMongoObjArr = (objArr: any[]): any => {
  const dup = objArr.map((obj) => {
    const copy = { ...obj };
    delete copy._id;
    delete copy.__v;
    return copy;
  });
  return dup;
};

const testEmail = "example@gmail.com";
const testPassword = "123456";
const testFirstName = "testFirst";
const testLastName = "testLast";
const user1 = {
  email: testEmail,
  firstName: testFirstName,
  lastName: testLastName,
  admin: true,
  verified: true,
};

const testEmail2 = "testemail2@gmail.com";
const testPassword2 = "123456";
const testFirstName2 = "test2First";
const testLastName2 = "test3Last";
const user2 = {
  email: testEmail2,
  firstName: testFirstName2,
  lastName: testLastName2,
  admin: false,
  verified: true,
};

const testEmail3 = "testemail3@gmail.com";
const testPassword3 = "123456";
const testFirstName3 = "test3First";
const testLastName3 = "test3Last";
const user3 = {
  email: testEmail3,
  firstName: testFirstName3,
  lastName: testLastName3,
  admin: true,
  verified: true,
};

const testEmail4 = "testemail4@gmail.com";
const testPassword4 = "123456";
const testFirstName4 = "test4First";
const testLastName4 = "test4Last";
const user4 = {
  email: testEmail4,
  firstName: testFirstName4,
  lastName: testLastName4,
  admin: false,
  verified: true,
};

beforeAll(async () => {
  // connects to an in memory database since this is a testing environment
  dbConnection = await MongoConnection.getInstance();
  dbConnection.open();

  sessionStore = dbConnection.createSessionStore(); // for storing user sessions in the db
  app = createExpressApp(sessionStore); // instantiate express app
  server = app.listen(); // instantiate server to listen on some unused port
  agent = request.agent(server); // instantiate supertest agent
});

afterAll(async () => {
  sessionStore.close();
  dbConnection.close();
});

beforeEach(async () => {
  // Clear the database before each test
  dbConnection.clearInMemoryCollections();

  // Create test users directly with admin status
  await User.create(user1);
  await User.create(user2);
  await User.create(user3);
  await User.create(user4);

  // Login as admin user
  const response = await agent.post("/api/auth/login").send({
    email: testEmail,
    password: testPassword,
  });
  expect(response.status).toBe(StatusCode.OK);
  expect(await Session.countDocuments()).toBe(1);
});

describe("testing admin routes", () => {
  describe("testing admin routes as admin", () => {
    // Set up test users and login as admin before each test
    beforeEach(async () => {
      // Clear the database before each test
      dbConnection.clearInMemoryCollections();

      // Create test users directly with admin status
      await User.create(user1);
      await User.create(user2);
      await User.create(user3);
      await User.create(user4);

      // Login as admin user
      const response = await agent.post("/api/auth/login").send({
        email: testEmail,
        password: testPassword,
      });
      expect(response.status).toBe(StatusCode.OK);
      expect(await Session.countDocuments()).toBe(1);
    });

    describe("testing GET /api/admin/users", () => {
      it("admin can get all users", async () => {
        // get all users
        const response = await agent.get("/api/admin/all").send();
        expect(response.status).toBe(StatusCode.OK);
        expect(cleanMongoObjArr(response.body)).toContainEqual(user1);
        expect(cleanMongoObjArr(response.body)).toContainEqual(user2);
        expect(cleanMongoObjArr(response.body)).toContainEqual(user3);
        expect(cleanMongoObjArr(response.body)).toContainEqual(user4);
      });
    });

    describe("testing GET /api/admin/adminstatus", () => {
      it("admin calling /adminstatus is true", async () => {
        // check admin status
        const response = await agent.get("/api/admin/adminstatus").send();
        expect(response.status).toBe(StatusCode.OK);
      });
    });

    describe("testing DELETE /api/admin/:email", () => {
      it("admin deleting user removes user", async () => {
        // delete user
        let response = await agent.delete(`/api/admin/${testEmail4}`).send();
        expect(response.status).toBe(StatusCode.OK);

        // check that user was deleted
        response = await agent.get("/api/admin/all").send();
        expect(response.status).toBe(StatusCode.OK);
        expect(cleanMongoObjArr(response.body)).toContainEqual(user1);
        expect(cleanMongoObjArr(response.body)).toContainEqual(user2);
        expect(cleanMongoObjArr(response.body)).toContainEqual(user3);
        expect(cleanMongoObjArr(response.body)).not.toContainEqual(user4);
      });

      it("admin attempting to delete self throws error", async () => {
        let response = await agent.delete(`/api/admin/${testEmail}`).send();
        expect(response.status).toBe(StatusCode.BAD_REQUEST);

        response = await agent.get("/api/admin/all").send();
        expect(response.status).toBe(StatusCode.OK);
        expect(cleanMongoObjArr(response.body)).toContainEqual(user1);
        expect(cleanMongoObjArr(response.body)).toContainEqual(user2);
        expect(cleanMongoObjArr(response.body)).toContainEqual(user3);
        expect(cleanMongoObjArr(response.body)).toContainEqual(user4);
      });

      it("admin attempting to delete other admin throws error", async () => {
        let response = await agent.delete(`/api/admin/${testEmail3}`).send();
        expect(response.status).toBe(StatusCode.FORBIDDEN);

        response = await agent.get("/api/admin/all").send();
        expect(response.status).toBe(StatusCode.OK);
        expect(cleanMongoObjArr(response.body)).toContainEqual(user1);
        expect(cleanMongoObjArr(response.body)).toContainEqual(user2);
        expect(cleanMongoObjArr(response.body)).toContainEqual(user3);
        expect(cleanMongoObjArr(response.body)).toContainEqual(user4);
      });

      it("deleting non-existent user throws error", async () => {
        let response = await agent.delete(`/api/admin/notexistent`).send();
        expect(response.status).toBe(StatusCode.NOT_FOUND);

        response = await agent.get("/api/admin/all").send();
        expect(response.status).toBe(StatusCode.OK);
        expect(cleanMongoObjArr(response.body)).toContainEqual(user1);
        expect(cleanMongoObjArr(response.body)).toContainEqual(user2);
        expect(cleanMongoObjArr(response.body)).toContainEqual(user3);
        expect(cleanMongoObjArr(response.body)).toContainEqual(user4);
      });
    });
  });

  describe("testing admin routes as non-admin", () => {
    // Set up test users and login as non-admin before each test
    beforeEach(async () => {
      // Clear the database before each test
      dbConnection.clearInMemoryCollections();

      // Create test users - user1 as non-admin for testing
      const nonAdminUser = { ...user1, admin: false };
      await User.create(nonAdminUser);
      await User.create(user2);
      await User.create(user3);
      await User.create(user4);

      // Login as non-admin user
      const response = await agent.post("/api/auth/login").send({
        email: testEmail,
        password: testPassword,
      });
      expect(response.status).toBe(StatusCode.OK);
      expect(await Session.countDocuments()).toBe(1);
    });

    describe("testing GET /api/admin/users", () => {
      it("non admin cannot get all users", async () => {
        // get all users
        const response = await agent.get("/api/admin/all").send();
        expect(response.status).toBe(StatusCode.UNAUTHORIZED);
      });
    });

    describe("testing GET /api/admin/adminstatus", () => {
      it("non admin calling /adminstatus throwsError", async () => {
        // check admin status
        const response = await agent.get("/api/admin/adminstatus").send();
        expect(response.status).toBe(StatusCode.UNAUTHORIZED);
      });
    });

    describe("testing DELETE /api/admin/:email", () => {
      it("non admin attempting to delete user throws error", async () => {
        // delete user
        const response = await agent.delete(`/api/admin/${testEmail4}`).send();
        expect(response.status).toBe(StatusCode.UNAUTHORIZED);
      });
    });
  });
});
