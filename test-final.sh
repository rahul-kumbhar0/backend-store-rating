#!/bin/bash

echo "=== FINAL TESTING SCRIPT ==="

# Test 1: Register and Login Normal User
echo "1. Testing Normal User Registration and Login..."
curl -s -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Final Test User Full Name",
    "email": "final@test.com",
    "password": "FinalPass123!",
    "address": "Final Test Address"
  }' | jq '.'

# Test 2: Login as Admin
echo "2. Testing Admin Login..."
ADMIN_TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "AdminPass123!"
  }' | jq -r '.token')

echo "Admin Token: $ADMIN_TOKEN"

# Test 3: Admin Dashboard
echo "3. Testing Admin Dashboard..."
curl -s -X GET http://localhost:5000/api/admin/dashboard \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.'

# Test 4: Create Store as Admin
echo "4. Testing Store Creation..."
curl -s -X POST http://localhost:5000/api/admin/stores \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "name": "Final Test Store",
    "email": "final@store.com",
    "address": "Final Store Address"
  }' | jq '.'

# Test 5: Normal User Gets Stores
echo "5. Testing Normal User Store Access..."
NORMAL_TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "final@test.com",
    "password": "FinalPass123!"
  }' | jq -r '.token')

curl -s -X GET http://localhost:5000/api/user/stores \
  -H "Authorization: Bearer $NORMAL_TOKEN" | jq '.'

# Test 6: Normal User Submits Rating
echo "6. Testing Rating Submission..."
curl -s -X POST http://localhost:5000/api/user/ratings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $NORMAL_TOKEN" \
  -d '{
    "rating": 5,
    "storeId": 1
  }' | jq '.'

echo "=== TESTING COMPLETE ==="