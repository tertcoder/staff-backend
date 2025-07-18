// Comprehensive tests for staff API using Jest, Supertest, mongodb-memory-server
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server');
const Staff = require('../models/Staff');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Staff.deleteMany();
});

describe('Staff API', () => {
  const validStaff = {
    name: 'John Doe',
    position: 'Manager',
    email: 'john@example.com',
    salary: 50000,
    hireDate: '2023-01-01',
    department: 'Finance',
    status: 'active'
  };

  it('should create a staff member', async () => {
    const res = await request(app)
      .post('/api/staff')
      .send(validStaff);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.name).toBe('John Doe');
  });

  it('should get all staff', async () => {
    await Staff.create({ ...validStaff, email: 'jane@example.com', name: 'Jane Doe' });
    const res = await request(app).get('/api/staff');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('should get a staff member by id', async () => {
    const staff = await Staff.create({ ...validStaff, email: 'sam@example.com', name: 'Sam Smith' });
    const res = await request(app).get(`/api/staff/${staff._id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Sam Smith');
  });

  it('should update a staff member', async () => {
    const staff = await Staff.create({ ...validStaff, email: 'alex@example.com', name: 'Alex Lee', position: 'IT' });
    const res = await request(app)
      .put(`/api/staff/${staff._id}`)
      .send({ ...validStaff, name: 'Alex Lee', position: 'Lead IT', email: 'alex@example.com' });
    expect(res.statusCode).toBe(200);
    expect(res.body.position).toBe('Lead IT');
  });

  it('should delete a staff member', async () => {
    const staff = await Staff.create({ ...validStaff, email: 'chris@example.com', name: 'Chris Kim', position: 'Finance' });
    const res = await request(app).delete(`/api/staff/${staff._id}`);
    expect(res.statusCode).toBe(204);
    const found = await Staff.findById(staff._id);
    expect(found).toBeNull();
  });

  it('should return 404 for non-existent staff', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/staff/${fakeId}`);
    expect(res.statusCode).toBe(404);
  });
});
