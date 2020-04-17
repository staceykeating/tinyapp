const { assert } = require('chai');

const { returnID } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('returnID', function() {
  it('should return a user with valid email', function() {
    const user = returnID("user@example.com", testUsers)
    const expectedOutput = "userRandomID";
    assert.equal(returnID("user@example.com", testUsers), "userRandomID");
  });

  it('should return false with invalid email', function() {
    const user = returnID("user@example.com", testUsers)
    const expectedOutput = "userRandomID";
    assert.equal(returnID("user3@example.com", testUsers), false);
  });

});
