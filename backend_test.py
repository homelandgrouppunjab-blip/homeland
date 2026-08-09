import requests
import sys
from datetime import datetime

class HomelandAPITester:
    def __init__(self, base_url="https://homeland-preview.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        req_headers = {'Content-Type': 'application/json'}
        if self.token:
            req_headers['Authorization'] = f'Bearer {self.token}'
        if headers:
            req_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Test {self.tests_run}: {name}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=req_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=req_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=req_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=req_headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ PASSED - Status: {response.status_code}")
            else:
                print(f"❌ FAILED - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}")
                self.failed_tests.append(f"{name} - Expected {expected_status}, got {response.status_code}")

            try:
                return success, response.json() if response.text else {}
            except Exception:
                return success, {}

        except Exception as e:
            print(f"❌ FAILED - Error: {str(e)}")
            self.failed_tests.append(f"{name} - Error: {str(e)}")
            return False, {}

    # ========== PUBLIC API TESTS ==========
    def test_public_apis(self):
        print("\n" + "="*60)
        print("TESTING PUBLIC APIs")
        print("="*60)

        # Test 1: GET /api/projects (all)
        success, projects = self.run_test(
            "GET /api/projects (all)",
            "GET", "projects", 200
        )
        if success and projects:
            print(f"   Found {len(projects)} projects")
            self.project_slug = projects[0].get('slug') if projects else None
            self.project_id = projects[0].get('id') if projects else None

        # Test 2: GET /api/projects with status filter
        self.run_test(
            "GET /api/projects?status=ONGOING",
            "GET", "projects?status=ONGOING", 200
        )

        # Test 3: GET /api/projects with type filter
        self.run_test(
            "GET /api/projects?type=Residential",
            "GET", "projects?type=Residential", 200
        )

        # Test 4: GET /api/projects with featured filter
        self.run_test(
            "GET /api/projects?featured=true",
            "GET", "projects?featured=true", 200
        )

        # Test 5: GET /api/projects with search
        self.run_test(
            "GET /api/projects?search=mohali",
            "GET", "projects?search=mohali", 200
        )

        # Test 6: GET /api/projects with sort
        self.run_test(
            "GET /api/projects?sort=name",
            "GET", "projects?sort=name", 200
        )

        # Test 7: GET /api/projects/{slug}
        if hasattr(self, 'project_slug') and self.project_slug:
            success, project = self.run_test(
                f"GET /api/projects/{self.project_slug}",
                "GET", f"projects/{self.project_slug}", 200
            )
            if success:
                print(f"   Project: {project.get('name')}")

        # Test 8: GET /api/content
        success, content = self.run_test(
            "GET /api/content",
            "GET", "content", 200
        )

        # Test 9: GET /api/team
        success, team = self.run_test(
            "GET /api/team",
            "GET", "team", 200
        )
        if success:
            print(f"   Found {len(team)} team members")

        # Test 10: GET /api/faqs
        success, faqs = self.run_test(
            "GET /api/faqs",
            "GET", "faqs", 200
        )
        if success:
            print(f"   Found {len(faqs)} FAQs")

        # Test 11: GET /api/rera
        success, rera = self.run_test(
            "GET /api/rera",
            "GET", "rera", 200
        )
        if success:
            print(f"   Found {len(rera)} RERA entries")

        # Test 12: GET /api/brochures
        success, brochures = self.run_test(
            "GET /api/brochures",
            "GET", "brochures", 200
        )
        if success:
            print(f"   Found {len(brochures)} brochures")

        # Test 13: POST /api/leads (valid)
        timestamp = datetime.now().strftime('%H%M%S')
        success, lead = self.run_test(
            "POST /api/leads (valid)",
            "POST", "leads", 200,
            data={
                "name": f"Test User {timestamp}",
                "email": f"test{timestamp}@example.com",
                "phone": "9876543210",
                "project": "Any",
                "requirement": "Residential",
                "budget": "50L-1Cr",
                "message": "Test enquiry",
                "website": ""  # honeypot empty
            }
        )
        if success:
            self.lead_id = lead.get('id')
            print(f"   Lead created: {lead.get('id')}")

        # Test 14: POST /api/leads (honeypot - should accept but not store)
        success, lead = self.run_test(
            "POST /api/leads (honeypot filled - bot)",
            "POST", "leads", 200,
            data={
                "name": "Bot User",
                "email": "bot@spam.com",
                "phone": "0000000000",
                "project": "Any",
                "website": "http://spam.com"  # honeypot filled
            }
        )
        if success:
            print(f"   Honeypot test: Bot request accepted (but should not be stored)")

        # Test 15: POST /api/leads (invalid email)
        success, lead = self.run_test(
            "POST /api/leads (invalid email)",
            "POST", "leads", 422,  # Pydantic validation error
            data={
                "name": "Invalid Email User",
                "email": "not-an-email",
                "phone": "9876543210"
            }
        )

    # ========== ADMIN AUTH TESTS ==========
    def test_admin_auth(self):
        print("\n" + "="*60)
        print("TESTING ADMIN AUTH")
        print("="*60)

        # Test 16: POST /api/admin/login (invalid credentials)
        self.run_test(
            "POST /api/admin/login (invalid credentials)",
            "POST", "admin/login", 401,
            data={"email": "wrong@example.com", "password": "wrongpass"}
        )

        # Test 17: POST /api/admin/login (valid credentials)
        success, response = self.run_test(
            "POST /api/admin/login (valid credentials)",
            "POST", "admin/login", 200,
            data={"email": "admin@homelandgroup.org", "password": "Homeland@2013"}
        )
        if success and 'access_token' in response:
            self.token = response['access_token']
            print(f"   Token obtained: {self.token[:20]}...")

        # Test 18: GET /api/admin/me (without token)
        temp_token = self.token
        self.token = None
        self.run_test(
            "GET /api/admin/me (without token)",
            "GET", "admin/me", 401
        )
        self.token = temp_token

        # Test 19: GET /api/admin/me (with token)
        success, admin = self.run_test(
            "GET /api/admin/me (with token)",
            "GET", "admin/me", 200
        )
        if success:
            print(f"   Admin email: {admin.get('email')}")

    # ========== ADMIN PROTECTED TESTS ==========
    def test_admin_protected(self):
        print("\n" + "="*60)
        print("TESTING ADMIN PROTECTED ENDPOINTS")
        print("="*60)

        if not self.token:
            print("⚠️  Skipping admin tests - no token available")
            return

        # Test 20: GET /api/admin/stats
        success, stats = self.run_test(
            "GET /api/admin/stats",
            "GET", "admin/stats", 200
        )
        if success:
            print(f"   Stats: {stats}")

        # Test 21: GET /api/admin/projects
        success, projects = self.run_test(
            "GET /api/admin/projects",
            "GET", "admin/projects", 200
        )
        if success:
            print(f"   Found {len(projects)} projects in admin")

        # Test 22: POST /api/admin/projects (create)
        timestamp = datetime.now().strftime('%H%M%S')
        success, new_project = self.run_test(
            "POST /api/admin/projects (create)",
            "POST", "admin/projects", 200,
            data={
                "name": f"Test Project {timestamp}",
                "tagline": "Test tagline",
                "status": "UPCOMING",
                "location": "Test Location",
                "city": "Mohali",
                "type": "Residential",
                "description": "Test description"
            }
        )
        if success:
            self.test_project_id = new_project.get('id')
            print(f"   Created project: {self.test_project_id}")

        # Test 23: PUT /api/admin/projects/{id} (update)
        if hasattr(self, 'test_project_id'):
            success, updated = self.run_test(
                "PUT /api/admin/projects/{id} (update)",
                "PUT", f"admin/projects/{self.test_project_id}", 200,
                data={
                    "name": f"Updated Test Project {timestamp}",
                    "tagline": "Updated tagline",
                    "status": "ONGOING",
                    "location": "Updated Location",
                    "city": "Mohali",
                    "type": "Commercial",
                    "description": "Updated description"
                }
            )

        # Test 24: DELETE /api/admin/projects/{id}
        if hasattr(self, 'test_project_id'):
            self.run_test(
                "DELETE /api/admin/projects/{id}",
                "DELETE", f"admin/projects/{self.test_project_id}", 200
            )

        # Test 25: GET /api/admin/leads
        success, leads = self.run_test(
            "GET /api/admin/leads",
            "GET", "admin/leads", 200
        )
        if success:
            print(f"   Found {len(leads)} leads")
            if leads and hasattr(self, 'lead_id'):
                # Find our test lead
                test_lead = next((l for l in leads if l.get('id') == self.lead_id), None)
                if test_lead:
                    print(f"   Test lead found in admin: {test_lead.get('name')}")

        # Test 26: PUT /api/admin/leads/{id} (status change)
        if hasattr(self, 'lead_id'):
            self.run_test(
                "PUT /api/admin/leads/{id} (status change)",
                "PUT", f"admin/leads/{self.lead_id}", 200,
                data={"status": "contacted"}
            )

        # Test 27: DELETE /api/admin/leads/{id}
        if hasattr(self, 'lead_id'):
            self.run_test(
                "DELETE /api/admin/leads/{id}",
                "DELETE", f"admin/leads/{self.lead_id}", 200
            )

        # Test 28: PUT /api/admin/content
        success, content = self.run_test(
            "PUT /api/admin/content",
            "PUT", "admin/content", 200,
            data={
                "key": "main",
                "company_name": "Homeland Group Mohali",
                "tagline": "Building Dreams, Creating Landmarks"
            }
        )

        # Test 29: POST /api/admin/team (create)
        timestamp = datetime.now().strftime('%H%M%S')
        success, team_member = self.run_test(
            "POST /api/admin/team (create)",
            "POST", "admin/team", 200,
            data={
                "name": f"Test Member {timestamp}",
                "role": "Test Role",
                "expertise": "Testing",
                "bio": "Test bio",
                "order": 99
            }
        )
        if success:
            self.test_team_id = team_member.get('id')
            print(f"   Created team member: {self.test_team_id}")

        # Test 30: PUT /api/admin/team/{id} (update)
        if hasattr(self, 'test_team_id'):
            self.run_test(
                "PUT /api/admin/team/{id} (update)",
                "PUT", f"admin/team/{self.test_team_id}", 200,
                data={
                    "name": f"Updated Test Member {timestamp}",
                    "role": "Updated Role",
                    "expertise": "Updated Testing",
                    "bio": "Updated bio",
                    "order": 98
                }
            )

        # Test 31: DELETE /api/admin/team/{id}
        if hasattr(self, 'test_team_id'):
            self.run_test(
                "DELETE /api/admin/team/{id}",
                "DELETE", f"admin/team/{self.test_team_id}", 200
            )

    def print_summary(self):
        print("\n" + "="*60)
        print("TEST SUMMARY")
        print("="*60)
        print(f"Total tests run: {self.tests_run}")
        print(f"Tests passed: {self.tests_passed}")
        print(f"Tests failed: {self.tests_run - self.tests_passed}")
        print(f"Success rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        if self.failed_tests:
            print("\n❌ Failed tests:")
            for test in self.failed_tests:
                print(f"   - {test}")
        
        return 0 if self.tests_passed == self.tests_run else 1

def main():
    print("="*60)
    print("HOMELAND GROUP MOHALI - API TEST SUITE")
    print("="*60)
    
    tester = HomelandAPITester()
    
    # Run all test suites
    tester.test_public_apis()
    tester.test_admin_auth()
    tester.test_admin_protected()
    
    # Print summary
    return tester.print_summary()

if __name__ == "__main__":
    sys.exit(main())
