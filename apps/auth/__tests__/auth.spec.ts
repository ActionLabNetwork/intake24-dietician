import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import { app } from '@intake24-dietician/auth/app';

chai.use(chaiHttp);

describe('JWT Auth', () => {
  it('should return a token when login is successful', (done) => {
    chai
      .request(app)
      .post('/login')
      .send({ username: 'user', password: 'pass' })
      .end((_, res) => {
        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('token');
        done();
      });
  });

  it('should return an error for invalid credentials', (done) => {
    chai
      .request(app)
      .post('/login')
      .send({ username: 'user', password: 'wrongpass' })
      .end((_, res) => {
        expect(res.status).to.equal(401);
        expect(res.body).to.have.property('error');
        done();
      });
  });
});
