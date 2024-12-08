export const API_DOCS = {
  // Public Endpoints
  health: {
    method: 'GET',
    url: '/health',
    description: 'Check API health status',
    response: {
      success: true,
      data: {
        status: 'ok',
        timestamp: '2024-11-28T17:56:23.345Z',
        service: 'TaskFlow API'
      }
    }
  },

  // Auth Endpoints
  auth: {
    register: {
      method: 'POST',
      url: '/auth/register',
      description: 'Register a new user',
      body: {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      },
      response: {
        success: true,
        data: {
          token: 'jwt_token_here',
          user: {
            id: 1,
            name: 'Test User',
            email: 'test@example.com',
            is_admin: false
          }
        },
        message: 'User registered successfully'
      }
    },

    login: {
      method: 'POST',
      url: '/auth/login',
      description: 'Login user',
      body: {
        email: 'test@example.com',
        password: 'password123'
      },
      response: {
        success: true,
        data: {
          token: 'jwt_token_here',
          user: {
            id: 1,
            name: 'Test User',
            email: 'test@example.com',
            is_admin: false
          }
        },
        message: 'Login successful'
      }
    },

    logout: {
      method: 'POST',
      url: '/auth/logout',
      description: 'Logout user',
      response: {
        success: true,
        message: 'Logged out successfully'
      }
    }
  },

  // User Endpoints
  users: {
    profile: {
      method: 'GET',
      url: '/users/profile',
      description: 'Get user profile',
      response: {
        success: true,
        data: {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
          balance: '150.00',
          pendingEarnings: '20.00',
          totalWithdrawn: '100.00',
          tasksCompleted: 15,
          successRate: '95.00',
          averageRating: '4.80',
          country: 'US',
          age: 25,
          phoneNumber: '+1234567890',
          bio: 'Test bio',
          timezone: 'UTC',
          language: 'en',
          emailNotifications: true
        }
      }
    },

    updateProfile: {
      method: 'PUT',
      url: '/users/profile',
      description: 'Update user profile',
      body: {
        name: 'Updated Name',
        country: 'US',
        age: 25,
        phoneNumber: '+1234567890',
        bio: 'Updated bio',
        timezone: 'UTC',
        language: 'en',
        emailNotifications: true
      },
      response: {
        success: true,
        data: {
          // Updated user object
        },
        message: 'Profile updated successfully'
      }
    },

    leaderboard: {
      method: 'GET',
      url: '/users/leaderboard',
      description: 'Get user leaderboard',
      response: {
        success: true,
        data: [
          {
            id: 1,
            name: 'Top User',
            balance: '500.00',
            tasksCompleted: 50
          }
          // More users...
        ]
      }
    }
  },

  // Task Endpoints
  tasks: {
    list: {
      method: 'GET',
      url: '/tasks',
      description: 'Get all tasks',
      response: {
        success: true,
        data: [
          {
            id: 1,
            title: 'Test Task',
            description: 'Task description',
            reward: 15.00,
            timeEstimate: '30 minutes',
            category: 'Testing',
            difficulty: 'Easy',
            timeInSeconds: 1800,
            steps: ['Step 1', 'Step 2'],
            approvalType: 'automatic'
          }
          // More tasks...
        ]
      }
    },

    submit: {
      method: 'POST',
      url: '/tasks/:taskId/submit',
      description: 'Submit task completion',
      body: {
        screenshotUrl: 'https://example.com/screenshot.jpg'
      },
      response: {
        success: true,
        data: {
          submission: {
            id: 1,
            taskId: 1,
            userId: 1,
            status: 'pending',
            screenshotUrl: 'https://example.com/screenshot.jpg'
          }
        },
        message: 'Task submitted successfully'
      }
    }
  },

  // Transaction Endpoints
  transactions: {
    list: {
      method: 'GET',
      url: '/transactions',
      description: 'Get user transactions',
      response: {
        success: true,
        data: [
          {
            id: 1,
            userId: 1,
            taskId: 1,
            amount: 15.00,
            type: 'earning',
            status: 'completed',
            createdAt: '2024-11-28T17:56:23.345Z'
          }
          // More transactions...
        ]
      }
    },

    withdraw: {
      method: 'POST',
      url: '/transactions/withdraw',
      description: 'Request withdrawal',
      body: {
        amount: 50.00
      },
      response: {
        success: true,
        data: {
          transaction: {
            id: 2,
            userId: 1,
            amount: 50.00,
            type: 'withdrawal',
            status: 'pending',
            createdAt: '2024-11-28T17:56:23.345Z'
          }
        },
        message: 'Withdrawal request submitted'
      }
    }
  },

  // Notification Endpoints
  notifications: {
    list: {
      method: 'GET',
      url: '/notifications',
      description: 'Get user notifications',
      response: {
        success: true,
        data: [
          {
            id: 1,
            userId: 1,
            title: 'Task Completed',
            message: 'You earned $15.00',
            type: 'success',
            isRead: false,
            createdAt: '2024-11-28T17:56:23.345Z'
          }
          // More notifications...
        ]
      }
    },

    markAsRead: {
      method: 'PUT',
      url: '/notifications/:id/read',
      description: 'Mark notification as read',
      response: {
        success: true,
        message: 'Notification marked as read'
      }
    },

    markAllAsRead: {
      method: 'PUT',
      url: '/notifications/read-all',
      description: 'Mark all notifications as read',
      response: {
        success: true,
        message: 'All notifications marked as read'
      }
    }
  },

  // Admin Endpoints
  admin: {
    users: {
      method: 'GET',
      url: '/admin/users',
      description: 'Get all users (admin only)',
      response: {
        success: true,
        data: [
          {
            id: 1,
            name: 'John Doe',
            email: 'john@example.com',
            balance: '150.00',
            pendingEarnings: '20.00',
            totalWithdrawn: '100.00',
            tasksCompleted: 15,
            successRate: '95.00',
            averageRating: '4.80',
            createdAt: '2024-11-28T17:56:23.345Z'
          }
          // More users...
        ]
      }
    },

    stats: {
      method: 'GET',
      url: '/admin/stats',
      description: 'Get dashboard statistics (admin only)',
      response: {
        success: true,
        data: {
          users: 100,
          tasks: 50,
          pendingSubmissions: 10,
          totalEarnings: 5000.00,
          recentActivity: {
            newUsers: 5,
            completedTasks: 20,
            totalRevenue: 1000.00
          }
        }
      }
    },

    pendingSubmissions: {
      method: 'GET',
      url: '/admin/submissions/pending',
      description: 'Get pending task submissions (admin only)',
      response: {
        success: true,
        data: [
          {
            id: 1,
            taskId: 1,
            userId: 1,
            status: 'pending',
            screenshotUrl: 'https://example.com/screenshot.jpg',
            submittedAt: '2024-11-28T17:56:23.345Z',
            user: {
              name: 'John Doe',
              email: 'john@example.com'
            },
            task: {
              title: 'Website Testing',
              reward: 15.00
            }
          }
          // More submissions...
        ]
      }
    },

    reviewSubmission: {
      method: 'PUT',
      url: '/tasks/:taskId/review',
      description: 'Review task submission (admin only)',
      body: {
        submissionId: 1,
        status: 'approved' // or 'rejected'
      },
      response: {
        success: true,
        data: {
          submission: {
            id: 1,
            status: 'approved',
            updatedAt: '2024-11-28T17:56:23.345Z'
          }
        },
        message: 'Submission reviewed successfully'
      }
    },

    createTask: {
      method: 'POST',
      url: '/tasks',
      description: 'Create new task (admin only)',
      body: {
        title: 'New Task',
        description: 'Task description',
        reward: 15.00,
        timeEstimate: '30 minutes',
        category: 'Testing',
        difficulty: 'Easy',
        timeInSeconds: 1800,
        steps: ['Step 1', 'Step 2'],
        approvalType: 'automatic'
      },
      response: {
        success: true,
        data: {
          // Created task object
        },
        message: 'Task created successfully'
      }
    }
  }
};