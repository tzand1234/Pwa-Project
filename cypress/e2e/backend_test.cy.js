describe('Backend Test Endpoints', () => {
  // Register a new user
  it('Registers a new user', () => {
    cy.request('POST', 'http://localhost:3000/users/register', {
      username: 'testuser',
      email: 'testuser@example.com',
      password: 'Password123'
    }).then((response) => {
      expect(response.status).to.equal(201);
      expect(response.body).to.have.property('id');
    });
  });

  // Attempt to register with an existing username
  it('Fails to register with an existing username', () => {
    cy.request({
      method: 'POST',
      url: 'http://localhost:3000/users/register',
      body: {
        username: 'testuser',
        email: 'another@example.com',
        password: 'Password123'
      },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.equal(400);
      expect(response.body).to.have.property('error', 'Username or email already exists');
    });
  });

  // Attempt to register with an invalid email
  it('Fails to register with an invalid email', () => {
    cy.request({
      method: 'POST',
      url: 'http://localhost:3000/users/register',
      body: {
        username: 'newuser',
        email: 'invalid-email',
        password: 'Password123'
      },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.equal(400);
      expect(response.body).to.have.property('error', 'Invalid email format');
    });
  });

  // Attempt to register with a weak password
  it('Fails to register with a weak password', () => {
    cy.request({
      method: 'POST',
      url: 'http://localhost:3000/users/register',
      body: {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'weak'
      },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.equal(400);
      expect(response.body).to.have.property('error', 'Password must be at least 8 characters long and contain at least one letter and one number');
    });
  });

  // Login with registered user
  it('Logs in with registered user', () => {
    cy.request('POST', 'http://localhost:3000/users/login', {
      username: 'testuser',
      password: 'Password123'
    }).then((response) => {
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('accessToken');
    });
  });

  // Attempt to login with wrong password
  it('Fails to login with wrong password', () => {
    cy.request({
      method: 'POST',
      url: 'http://localhost:3000/users/login',
      body: {
        username: 'testuser',
        password: 'WrongPassword'
      },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.equal(400);
      expect(response.body).to.have.property('error', 'Invalid credentials');
    });
  });


  // CRUD operations for Workouts
  describe('Workouts', () => {
    let accessToken;
    let workoutId;

    before(() => {
      // Log in to get access token
      cy.request('POST', 'http://localhost:3000/users/login', {
        username: 'testuser',
        password: 'Password123'
      }).then((response) => {
        accessToken = response.body.accessToken;
      });
    });

    // POST /workouts
    it('Creates a new workout with valid JWT token', () => {
      const newWorkout = {
        userId: 1,
        exercise: 'Test Exercise',
        description: 'This is a test workout',
        date: '2024-07-01',
        imageUrl: 'https://example.com/test-workout.jpg'
      };

      cy.request({
        method: 'POST',
        url: 'http://localhost:3000/workouts',
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        body: newWorkout
      }).then((response) => {
        expect(response.status).to.equal(201);
        expect(response.body).to.have.property('id');
        workoutId = response.body.id;
      });
    });

    // GET /workouts/:id
    it('Gets a workout by ID with valid JWT token', () => {
      cy.request({
        method: 'GET',
        url: `http://localhost:3000/workouts/${workoutId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('id', workoutId);
      });
    });

    // PUT /workouts/:id
    it('Updates a workout by ID with valid JWT token', () => {
      const updatedWorkout = {
        userId: 1,
        exercise: 'Updated Test Exercise',
        description: 'This is an updated test workout',
        date: '2024-07-02',
        imageUrl: 'https://example.com/updated-test-workout.jpg'
      };

      cy.request({
        method: 'PUT',
        url: `http://localhost:3000/workouts/${workoutId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        body: updatedWorkout
      }).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('message', `Workout ${workoutId} updated successfully`);
      });
    });

    // DELETE /workouts/:id
    it('Deletes a workout by ID with valid JWT token', () => {
      cy.request({
        method: 'DELETE',
        url: `http://localhost:3000/workouts/${workoutId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('message', `Workout ${workoutId} deleted successfully`);
      });
    });
  });

  // CRUD operations for Reviews
  describe('Reviews', () => {
    let accessToken;
    let workoutId;
    let reviewId;

    before(() => {
      // Log in to get access token
      cy.request('POST', 'http://localhost:3000/users/login', {
        username: 'testuser',
        password: 'Password123'
      }).then((response) => {
        accessToken = response.body.accessToken;

        // Create a new workout
        cy.request({
          method: 'POST',
          url: 'http://localhost:3000/workouts',
          headers: {
            Authorization: `Bearer ${accessToken}`
          },
          body: {
            userId: 1,
            exercise: 'Test Exercise',
            description: 'This is a test workout',
            date: '2024-07-01',
            imageUrl: 'https://example.com/test-workout.jpg'
          }
        }).then((workoutResponse) => {
          workoutId = workoutResponse.body.id;
        });
      });
    });

    // POST /workouts/:id/reviews
    it('Creates a new review with valid JWT token', () => {
      const newReview = {
        workoutId,
        userId: 1,
        rating: 5,
        comment: 'Great workout!'
      };

      cy.request({
        method: 'POST',
        url: `http://localhost:3000/workouts/${workoutId}/reviews`,
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        body: newReview
      }).then((response) => {
        expect(response.status).to.equal(201);
        expect(response.body).to.have.property('id');
        reviewId = response.body.id;
      });
    });

    // GET /workouts/:id/reviews
    it('Gets all reviews for a workout by ID with valid JWT token', () => {
      cy.request({
        method: 'GET',
        url: `http://localhost:3000/workouts/${workoutId}/reviews`,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.be.an('array');
        expect(response.body[0]).to.have.property('id', reviewId);
      });
    });

    // GET /workouts/:workoutId/reviews/:reviewId
    it('Gets a review by workout ID and review ID with valid JWT token', () => {
      cy.request({
        method: 'GET',
        url: `http://localhost:3000/workouts/${workoutId}/reviews/${reviewId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('id', reviewId);
      });
    });

    // PUT /workouts/:workoutId/reviews/:reviewId
    it('Updates a review by workout ID and review ID with valid JWT token', () => {
      const updatedReview = {
        workoutId,
        userId: 1,
        rating: 4,
        comment: 'Updated review comment'
      };

      cy.request({
        method: 'PUT',
        url: `http://localhost:3000/workouts/${workoutId}/reviews/${reviewId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        body: updatedReview
      }).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('message', `Review ${reviewId} updated successfully`);
      });
    });

    // DELETE /workouts/:workoutId/reviews/:reviewId
    it('Deletes a review by workout ID and review ID with valid JWT token', () => {
      cy.request({
        method: 'DELETE',
        url: `http://localhost:3000/workouts/${workoutId}/reviews/${reviewId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('message', `Review ${reviewId} deleted successfully`);
      });
    });
  });
});
