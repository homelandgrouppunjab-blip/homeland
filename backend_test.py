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

        # Test 16: POST /api/site-visits (valid)
        timestamp = datetime.now().strftime('%H%M%S')
        success, visit = self.run_test(
            "POST /api/site-visits (valid)",
            "POST", "site-visits", 200,
            data={
                "name": f"Test Visitor {timestamp}",
                "email": f"visitor{timestamp}@example.com",
                "phone": "9876543210",
                "project": "Any",
                "visit_date": "2025-09-15",
                "time_slot": "10:00 AM",
                "guests": "2",
                "notes": "Test site visit",
                "website": ""  # honeypot empty
            }
        )
        if success:
            self.visit_id = visit.get('id')
            print(f"   Site visit created: {visit.get('id')}")

        # Test 17: POST /api/site-visits (honeypot - should accept but not store)
        success, visit = self.run_test(
            "POST /api/site-visits (honeypot filled - bot)",
            "POST", "site-visits", 200,
            data={
                "name": "Bot Visitor",
                "email": "botvisitor@spam.com",
                "phone": "0000000000",
                "project": "Any",
                "visit_date": "2025-09-15",
                "time_slot": "10:00 AM",
                "website": "http://spam.com"  # honeypot filled
            }
        )
        if success:
            print(f"   Honeypot test: Bot request accepted (but should not be stored)")

        # Test 18: POST /api/site-visits (invalid email)
        success, visit = self.run_test(
            "POST /api/site-visits (invalid email)",
            "POST", "site-visits", 422,  # Pydantic validation error
            data={
                "name": "Invalid Email Visitor",
                "email": "not-an-email",
                "phone": "9876543210",
                "visit_date": "2025-09-15",
                "time_slot": "10:00 AM"
            }
        )

        # Test 19: GET /api/projects/homeland-regalia (check logo)
        success, regalia = self.run_test(
            "GET /api/projects/homeland-regalia (check logo)",
            "GET", "projects/homeland-regalia", 200
        )
        if success:
            logo = regalia.get('logo_image', '')
            if logo == '/regalia-logo.png':
                print(f"   ✅ Regalia logo correct: {logo}")
            else:
                print(f"   ⚠️  Regalia logo unexpected: {logo}")
                self.failed_tests.append(f"Regalia logo - Expected '/regalia-logo.png', got '{logo}'")

        # Test 20: GET /api/posts (all published posts)
        success, posts = self.run_test(
            "GET /api/posts (all published)",
            "GET", "posts", 200
        )
        if success:
            print(f"   Found {len(posts)} published posts")
            if posts:
                self.post_slug = posts[0].get('slug')
                # Verify only published posts are returned
                unpublished = [p for p in posts if not p.get('published', True)]
                if unpublished:
                    print(f"   ⚠️  Found {len(unpublished)} unpublished posts in public API")
                    self.failed_tests.append(f"Public posts API returned unpublished posts")

        # Test 21: GET /api/posts?category=News (filter by category)
        success, news_posts = self.run_test(
            "GET /api/posts?category=News",
            "GET", "posts?category=News", 200
        )
        if success:
            print(f"   Found {len(news_posts)} News posts")
            # Verify all returned posts are News category
            non_news = [p for p in news_posts if p.get('category') != 'News']
            if non_news:
                print(f"   ⚠️  Found {len(non_news)} non-News posts in News filter")
                self.failed_tests.append(f"News filter returned non-News posts")

        # Test 22: GET /api/posts?category=Media (filter by category)
        success, media_posts = self.run_test(
            "GET /api/posts?category=Media",
            "GET", "posts?category=Media", 200
        )
        if success:
            print(f"   Found {len(media_posts)} Media posts")

        # Test 23: GET /api/posts?category=Blog (filter by category)
        success, blog_posts = self.run_test(
            "GET /api/posts?category=Blog",
            "GET", "posts?category=Blog", 200
        )
        if success:
            print(f"   Found {len(blog_posts)} Blog posts")

        # Test 24: GET /api/posts/{slug} (single post)
        if hasattr(self, 'post_slug') and self.post_slug:
            success, post = self.run_test(
                f"GET /api/posts/{self.post_slug}",
                "GET", f"posts/{self.post_slug}", 200
            )
            if success:
                print(f"   Post: {post.get('title')}")
                # Verify post has required fields
                required = ['title', 'slug', 'category', 'content', 'author', 'date']
                missing = [f for f in required if not post.get(f)]
                if missing:
                    print(f"   ⚠️  Post missing fields: {missing}")
                    self.failed_tests.append(f"Post missing required fields: {missing}")

        # Test 25: GET /api/posts/nonexistent (404)
        self.run_test(
            "GET /api/posts/nonexistent (404)",
            "GET", "posts/nonexistent-post-slug", 404
        )

    # ========== ADMIN AUTH TESTS ==========
    def test_admin_auth(self):
        print("\n" + "="*60)
        print("TESTING ADMIN AUTH")
        print("="*60)

        # Test 26: POST /api/admin/login (invalid credentials)
        self.run_test(
            "POST /api/admin/login (invalid credentials)",
            "POST", "admin/login", 401,
            data={"email": "wrong@example.com", "password": "wrongpass"}
        )

        # Test 27: POST /api/admin/login (valid credentials)
        success, response = self.run_test(
            "POST /api/admin/login (valid credentials)",
            "POST", "admin/login", 200,
            data={"email": "admin@homelandgroup.org", "password": "Homeland@2013"}
        )
        if success and 'access_token' in response:
            self.token = response['access_token']
            print(f"   Token obtained: {self.token[:20]}...")

        # Test 28: GET /api/admin/me (without token)
        temp_token = self.token
        self.token = None
        self.run_test(
            "GET /api/admin/me (without token)",
            "GET", "admin/me", 401
        )
        self.token = temp_token

        # Test 29: GET /api/admin/me (with token)
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

        # Test 30: GET /api/admin/stats (check new fields)
        success, stats = self.run_test(
            "GET /api/admin/stats",
            "GET", "admin/stats", 200
        )
        if success:
            print(f"   Stats: {stats}")
            # Verify new fields exist
            if 'total_visits' in stats and 'new_visits' in stats:
                print(f"   ✅ New stats fields present: total_visits={stats['total_visits']}, new_visits={stats['new_visits']}")
            else:
                print(f"   ⚠️  Missing new stats fields")
                self.failed_tests.append("Stats missing total_visits or new_visits fields")

        # Test 31: GET /api/admin/projects
        success, projects = self.run_test(
            "GET /api/admin/projects",
            "GET", "admin/projects", 200
        )
        if success:
            print(f"   Found {len(projects)} projects in admin")

        # Test 32: POST /api/admin/projects (create)
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

        # Test 33: PUT /api/admin/projects/{id} (update)
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

        # Test 34: DELETE /api/admin/projects/{id}
        if hasattr(self, 'test_project_id'):
            self.run_test(
                "DELETE /api/admin/projects/{id}",
                "DELETE", f"admin/projects/{self.test_project_id}", 200
            )

        # Test 35: GET /api/admin/leads
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

        # Test 36: PUT /api/admin/leads/{id} (status change)
        if hasattr(self, 'lead_id'):
            self.run_test(
                "PUT /api/admin/leads/{id} (status change)",
                "PUT", f"admin/leads/{self.lead_id}", 200,
                data={"status": "contacted"}
            )

        # Test 37: DELETE /api/admin/leads/{id}
        if hasattr(self, 'lead_id'):
            self.run_test(
                "DELETE /api/admin/leads/{id}",
                "DELETE", f"admin/leads/{self.lead_id}", 200
            )

        # Test 32: GET /api/admin/site-visits
        success, visits = self.run_test(
            "GET /api/admin/site-visits",
            "GET", "admin/site-visits", 200
        )
        if success:
            print(f"   Found {len(visits)} site visits")
            if visits and hasattr(self, 'visit_id'):
                # Find our test visit
                test_visit = next((v for v in visits if v.get('id') == self.visit_id), None)
                if test_visit:
                    print(f"   Test visit found in admin: {test_visit.get('name')}")

        # Test 33: PUT /api/admin/site-visits/{id} (status change)
        if hasattr(self, 'visit_id'):
            self.run_test(
                "PUT /api/admin/site-visits/{id} (status change)",
                "PUT", f"admin/site-visits/{self.visit_id}", 200,
                data={"status": "confirmed"}
            )

        # Test 34: DELETE /api/admin/site-visits/{id}
        if hasattr(self, 'visit_id'):
            self.run_test(
                "DELETE /api/admin/site-visits/{id}",
                "DELETE", f"admin/site-visits/{self.visit_id}", 200
            )

        # Test 35: PUT /api/admin/content
        success, content = self.run_test(
            "PUT /api/admin/content",
            "PUT", "admin/content", 200,
            data={
                "key": "main",
                "company_name": "Homeland Group Mohali",
                "tagline": "Building Dreams, Creating Landmarks"
            }
        )

        # Test 36: POST /api/admin/team (create)
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

        # Test 37: PUT /api/admin/team/{id} (update)
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

        # Test 38: DELETE /api/admin/team/{id}
        if hasattr(self, 'test_team_id'):
            self.run_test(
                "DELETE /api/admin/team/{id}",
                "DELETE", f"admin/team/{self.test_team_id}", 200
            )

        # ========== FILE UPLOAD TESTS ==========
        print("\n" + "="*60)
        print("TESTING FILE UPLOAD")
        print("="*60)

        # Test 39: POST /api/admin/upload (image file)
        import io
        try:
            # Create a small test PNG image (1x1 pixel)
            png_data = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\x0cIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82'
            files = {'file': ('test.png', io.BytesIO(png_data), 'image/png')}
            url = f"{self.base_url}/admin/upload"
            headers = {'Authorization': f'Bearer {self.token}'}
            
            self.tests_run += 1
            print(f"\n🔍 Test {self.tests_run}: POST /api/admin/upload (image file)")
            
            response = requests.post(url, files=files, headers=headers, timeout=10)
            success = response.status_code == 200
            
            if success:
                self.tests_passed += 1
                result = response.json()
                print(f"✅ PASSED - Status: {response.status_code}")
                print(f"   Uploaded file URL: {result.get('url')}")
                
                # Store the uploaded filename for later tests
                if 'url' in result:
                    self.uploaded_file_url = result['url']
                    # Extract filename from URL like /api/uploads/abc123.png
                    self.uploaded_filename = result['url'].split('/')[-1]
                    
                    # Verify URL format
                    if not result['url'].startswith('/api/uploads/'):
                        print(f"   ⚠️  Unexpected URL format: {result['url']}")
                        self.failed_tests.append(f"Upload URL format - Expected /api/uploads/..., got {result['url']}")
            else:
                print(f"❌ FAILED - Expected 200, got {response.status_code}")
                print(f"   Response: {response.text[:200]}")
                self.failed_tests.append(f"POST /api/admin/upload (image) - Expected 200, got {response.status_code}")
        except Exception as e:
            print(f"❌ FAILED - Error: {str(e)}")
            self.failed_tests.append(f"POST /api/admin/upload (image) - Error: {str(e)}")

        # Test 40: GET /api/uploads/{filename} (serve uploaded file)
        if hasattr(self, 'uploaded_filename'):
            self.tests_run += 1
            print(f"\n🔍 Test {self.tests_run}: GET /api/uploads/{self.uploaded_filename}")
            
            try:
                url = f"{self.base_url}/uploads/{self.uploaded_filename}"
                response = requests.get(url, timeout=10)
                success = response.status_code == 200
                
                if success:
                    self.tests_passed += 1
                    print(f"✅ PASSED - Status: {response.status_code}")
                    print(f"   File served successfully, size: {len(response.content)} bytes")
                else:
                    print(f"❌ FAILED - Expected 200, got {response.status_code}")
                    self.failed_tests.append(f"GET /api/uploads/{self.uploaded_filename} - Expected 200, got {response.status_code}")
            except Exception as e:
                print(f"❌ FAILED - Error: {str(e)}")
                self.failed_tests.append(f"GET /api/uploads/{self.uploaded_filename} - Error: {str(e)}")

        # Test 41: POST /api/admin/upload (unsupported file type - .txt)
        try:
            txt_data = b'This is a text file'
            files = {'file': ('test.txt', io.BytesIO(txt_data), 'text/plain')}
            url = f"{self.base_url}/admin/upload"
            headers = {'Authorization': f'Bearer {self.token}'}
            
            self.tests_run += 1
            print(f"\n🔍 Test {self.tests_run}: POST /api/admin/upload (unsupported .txt file)")
            
            response = requests.post(url, files=files, headers=headers, timeout=10)
            success = response.status_code == 400
            
            if success:
                self.tests_passed += 1
                print(f"✅ PASSED - Status: {response.status_code}")
                print(f"   Correctly rejected unsupported file type")
            else:
                print(f"❌ FAILED - Expected 400, got {response.status_code}")
                print(f"   Response: {response.text[:200]}")
                self.failed_tests.append(f"POST /api/admin/upload (.txt rejection) - Expected 400, got {response.status_code}")
        except Exception as e:
            print(f"❌ FAILED - Error: {str(e)}")
            self.failed_tests.append(f"POST /api/admin/upload (.txt rejection) - Error: {str(e)}")

        # ========== ADMIN POSTS CRUD TESTS ==========
        print("\n" + "="*60)
        print("TESTING ADMIN POSTS CRUD")
        print("="*60)

        # Test 42: GET /api/admin/posts
        success, admin_posts = self.run_test(
            "GET /api/admin/posts",
            "GET", "admin/posts", 200
        )
        if success:
            print(f"   Found {len(admin_posts)} posts in admin")
            # Admin should see both published and unpublished
            published = [p for p in admin_posts if p.get('published', True)]
            unpublished = [p for p in admin_posts if not p.get('published', True)]
            print(f"   Published: {len(published)}, Unpublished: {len(unpublished)}")

        # Test 43: POST /api/admin/posts (create)
        timestamp = datetime.now().strftime('%H%M%S')
        success, new_post = self.run_test(
            "POST /api/admin/posts (create)",
            "POST", "admin/posts", 200,
            data={
                "title": f"Test Post {timestamp}",
                "category": "Blog",
                "excerpt": "Test excerpt for automated testing",
                "content": "This is test content.\n\nSecond paragraph of test content.",
                "cover_image": "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800",
                "author": "Test Author",
                "date": "2025-08-15",
                "published": True
            }
        )
        if success:
            self.test_post_id = new_post.get('id')
            self.test_post_slug = new_post.get('slug')
            print(f"   Created post: {self.test_post_id} (slug: {self.test_post_slug})")

        # Test 44: PUT /api/admin/posts/{id} (update)
        if hasattr(self, 'test_post_id'):
            success, updated_post = self.run_test(
                "PUT /api/admin/posts/{id} (update)",
                "PUT", f"admin/posts/{self.test_post_id}", 200,
                data={
                    "title": f"Updated Test Post {timestamp}",
                    "category": "News",
                    "excerpt": "Updated test excerpt",
                    "content": "Updated test content.\n\nUpdated second paragraph.",
                    "cover_image": "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800",
                    "author": "Updated Author",
                    "date": "2025-08-16",
                    "published": False
                }
            )
            if success:
                print(f"   Updated post: {updated_post.get('title')}")

        # Test 45: Verify updated post is NOT in public API (unpublished)
        if hasattr(self, 'test_post_slug'):
            self.tests_run += 1
            print(f"\n🔍 Test {self.tests_run}: GET /api/posts (verify unpublished post not visible)")
            
            try:
                url = f"{self.base_url}/posts"
                response = requests.get(url, timeout=10)
                
                if response.status_code == 200:
                    public_posts = response.json()
                    # Check if our unpublished test post is in the list
                    test_post_in_public = any(p.get('slug') == self.test_post_slug for p in public_posts)
                    
                    if not test_post_in_public:
                        self.tests_passed += 1
                        print(f"✅ PASSED - Unpublished post correctly hidden from public API")
                    else:
                        print(f"❌ FAILED - Unpublished post visible in public API")
                        self.failed_tests.append(f"Unpublished post visible in public API")
                else:
                    print(f"❌ FAILED - Could not fetch public posts")
                    self.failed_tests.append(f"Could not verify unpublished post visibility")
            except Exception as e:
                print(f"❌ FAILED - Error: {str(e)}")
                self.failed_tests.append(f"Unpublished post visibility check - Error: {str(e)}")

        # Test 46: DELETE /api/admin/posts/{id}
        if hasattr(self, 'test_post_id'):
            self.run_test(
                "DELETE /api/admin/posts/{id}",
                "DELETE", f"admin/posts/{self.test_post_id}", 200
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
