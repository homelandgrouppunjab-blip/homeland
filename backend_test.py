#!/usr/bin/env python3
"""
Backend API Tests for Homeland Group Node.js API
Tests all new features: Updates CRUD, Projects visibility/reorder, Theme customization
"""
import requests
import sys
from datetime import datetime

BASE_URL = "https://homeland-preview.preview.emergentagent.com/api"
ADMIN_EMAIL = "admin@homelandgroup.org"
ADMIN_PASSWORD = "Homeland@2013"

class HomelandAPITester:
    def __init__(self):
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def log(self, msg, status="info"):
        prefix = {"info": "ℹ️", "pass": "✅", "fail": "❌", "warn": "⚠️"}
        print(f"{prefix.get(status, 'ℹ️')} {msg}")

    def test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{BASE_URL}/{endpoint}"
        h = headers or {}
        if self.token and "Authorization" not in h:
            h["Authorization"] = f"Bearer {self.token}"
        
        self.tests_run += 1
        self.log(f"Testing {name}...", "info")
        
        try:
            if method == "GET":
                response = requests.get(url, headers=h, timeout=10)
            elif method == "POST":
                response = requests.post(url, json=data, headers=h, timeout=10)
            elif method == "PUT":
                response = requests.put(url, json=data, headers=h, timeout=10)
            elif method == "DELETE":
                response = requests.delete(url, headers=h, timeout=10)
            else:
                raise ValueError(f"Unsupported method: {method}")

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                self.log(f"PASSED - {name} (Status: {response.status_code})", "pass")
                try:
                    return True, response.json()
                except:
                    return True, {}
            else:
                self.log(f"FAILED - {name} (Expected {expected_status}, got {response.status_code})", "fail")
                self.failed_tests.append(f"{name}: Expected {expected_status}, got {response.status_code}")
                try:
                    self.log(f"Response: {response.text[:200]}", "warn")
                except:
                    pass
                return False, {}

        except Exception as e:
            self.log(f"FAILED - {name} (Error: {str(e)})", "fail")
            self.failed_tests.append(f"{name}: {str(e)}")
            return False, {}

    def run_all_tests(self):
        """Run all backend tests"""
        self.log("=" * 60, "info")
        self.log("HOMELAND GROUP API TESTS - ITERATION 14", "info")
        self.log("=" * 60, "info")

        # Test 1: Admin Login
        self.log("\n--- ADMIN AUTHENTICATION ---", "info")
        success, response = self.test(
            "Admin Login",
            "POST",
            "admin/login",
            200,
            data={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        if success and "access_token" in response:
            self.token = response["access_token"]
            self.log(f"Token obtained: {self.token[:20]}...", "pass")
        else:
            self.log("CRITICAL: Cannot proceed without admin token", "fail")
            return

        # Test 2: GET /api/updates (public)
        self.log("\n--- PUBLIC UPDATES API ---", "info")
        success, updates = self.test(
            "GET /api/updates (public, published only)",
            "GET",
            "updates",
            200
        )
        if success:
            self.log(f"Found {len(updates)} published updates", "info")
            # Verify sorting: pinned first, then by date desc
            if len(updates) > 1:
                pinned_found = False
                for i, upd in enumerate(updates):
                    if upd.get("pinned"):
                        pinned_found = True
                        self.log(f"Update '{upd.get('title')}' is pinned", "info")
                    elif pinned_found and upd.get("pinned"):
                        self.log("Sorting issue: pinned updates not at top", "fail")
                        self.failed_tests.append("Updates sorting: pinned not at top")
                        break

        # Test 3: Admin GET updates
        self.log("\n--- ADMIN UPDATES CRUD ---", "info")
        success, admin_updates = self.test(
            "GET /api/admin/updates (all updates)",
            "GET",
            "admin/updates",
            200
        )
        if success:
            self.log(f"Admin sees {len(admin_updates)} total updates", "info")

        # Test 4: Create Update
        new_update = {
            "title": f"Test Update {datetime.now().strftime('%H%M%S')}",
            "category": "Update",
            "excerpt": "Test excerpt for automated testing",
            "body": "Full test body content",
            "image": "",
            "link_type": "none",
            "project_slug": "",
            "external_url": "",
            "date": datetime.now().strftime("%Y-%m-%d"),
            "pinned": False,
            "published": True
        }
        success, created_update = self.test(
            "POST /api/admin/updates (create)",
            "POST",
            "admin/updates",
            200,
            data=new_update
        )
        update_id = created_update.get("id") if success else None

        # Test 5: Update with link_type variants
        if update_id:
            # Test link_type: project
            success, _ = self.test(
                "PUT /api/admin/updates (link_type: project)",
                "PUT",
                f"admin/updates/{update_id}",
                200,
                data={**new_update, "link_type": "project", "project_slug": "test-project"}
            )
            
            # Test link_type: external
            success, _ = self.test(
                "PUT /api/admin/updates (link_type: external)",
                "PUT",
                f"admin/updates/{update_id}",
                200,
                data={**new_update, "link_type": "external", "external_url": "https://example.com"}
            )

            # Test 6: Delete Update
            success, _ = self.test(
                "DELETE /api/admin/updates",
                "DELETE",
                f"admin/updates/{update_id}",
                200
            )

        # Test 7: GET /api/projects (public - excludes visible:false)
        self.log("\n--- PROJECTS VISIBILITY & REORDER ---", "info")
        success, public_projects = self.test(
            "GET /api/projects (public, visible only)",
            "GET",
            "projects",
            200
        )
        if success:
            self.log(f"Found {len(public_projects)} visible projects", "info")
            # Check if any project has visible:false
            for proj in public_projects:
                if proj.get("visible") == False:
                    self.log(f"ERROR: Project '{proj.get('name')}' has visible=false but is in public list", "fail")
                    self.failed_tests.append("Projects API: visible:false project in public list")

        # Test 8: Admin GET projects
        success, admin_projects = self.test(
            "GET /api/admin/projects (all projects)",
            "GET",
            "admin/projects",
            200
        )
        if success and len(admin_projects) > 0:
            self.log(f"Admin sees {len(admin_projects)} total projects", "info")
            
            # Test 9: Toggle visibility
            test_project = admin_projects[0]
            original_visible = test_project.get("visible", True)
            test_project["visible"] = not original_visible
            
            success, _ = self.test(
                f"PUT /api/admin/projects/:id (toggle visible to {not original_visible})",
                "PUT",
                f"admin/projects/{test_project['id']}",
                200,
                data=test_project
            )
            
            # Restore original state
            test_project["visible"] = original_visible
            self.test(
                "PUT /api/admin/projects/:id (restore visible)",
                "PUT",
                f"admin/projects/{test_project['id']}",
                200,
                data=test_project
            )

            # Test 10: Reorder projects
            if len(admin_projects) >= 2:
                proj1 = admin_projects[0]
                proj2 = admin_projects[1]
                
                # Swap order
                proj1["order"] = 999
                proj2["order"] = 1
                
                success1, _ = self.test(
                    "PUT /api/admin/projects/:id (reorder project 1)",
                    "PUT",
                    f"admin/projects/{proj1['id']}",
                    200,
                    data=proj1
                )
                
                success2, _ = self.test(
                    "PUT /api/admin/projects/:id (reorder project 2)",
                    "PUT",
                    f"admin/projects/{proj2['id']}",
                    200,
                    data=proj2
                )
                
                if success1 and success2:
                    # Verify order persisted
                    success, reordered = self.test(
                        "GET /api/admin/projects (verify reorder)",
                        "GET",
                        "admin/projects",
                        200
                    )
                    if success:
                        # Check if proj2 comes before proj1
                        proj2_idx = next((i for i, p in enumerate(reordered) if p["id"] == proj2["id"]), -1)
                        proj1_idx = next((i for i, p in enumerate(reordered) if p["id"] == proj1["id"]), -1)
                        if proj2_idx < proj1_idx:
                            self.log("Project reorder persisted correctly", "pass")
                        else:
                            self.log("Project reorder did NOT persist", "fail")
                            self.failed_tests.append("Projects reorder: order not persisted")

        # Test 11: Site Content - Theme & Logo
        self.log("\n--- SITE CONTENT & THEME ---", "info")
        success, content = self.test(
            "GET /api/content (public)",
            "GET",
            "content",
            200
        )
        
        if success:
            original_theme = content.get("theme", {})
            original_logo_light = content.get("site_logo_light", "")
            
            # Test theme update
            new_theme = {
                "font_display": "Crimson Text",
                "font_body": "Figtree",
                "font_scale": 1.06,
                "gold": "#D4AF37",
                "bg_dark": "#0F1012",
                "bg_light": "#FBF9F4"
            }
            
            content["theme"] = new_theme
            content["site_logo_light"] = "/test-logo-light.webp"
            
            success, updated = self.test(
                "PUT /api/admin/content (update theme & logo_light)",
                "PUT",
                "admin/content",
                200,
                data=content
            )
            
            if success:
                # Verify persistence
                success, verified = self.test(
                    "GET /api/content (verify theme persisted)",
                    "GET",
                    "content",
                    200
                )
                
                if success:
                    if verified.get("theme", {}).get("font_display") == "Crimson Text":
                        self.log("Theme font_display persisted correctly", "pass")
                    else:
                        self.log("Theme font_display did NOT persist", "fail")
                        self.failed_tests.append("Theme: font_display not persisted")
                    
                    if verified.get("site_logo_light") == "/test-logo-light.webp":
                        self.log("site_logo_light persisted correctly", "pass")
                    else:
                        self.log("site_logo_light did NOT persist", "fail")
                        self.failed_tests.append("Theme: site_logo_light not persisted")
                
                # Restore original
                content["theme"] = original_theme
                content["site_logo_light"] = original_logo_light
                self.test(
                    "PUT /api/admin/content (restore original)",
                    "PUT",
                    "admin/content",
                    200,
                    data=content
                )

        # Summary
        self.log("\n" + "=" * 60, "info")
        self.log(f"TESTS COMPLETED: {self.tests_passed}/{self.tests_run} passed", "info")
        if self.failed_tests:
            self.log(f"\nFailed tests ({len(self.failed_tests)}):", "fail")
            for fail in self.failed_tests:
                self.log(f"  - {fail}", "fail")
        self.log("=" * 60, "info")
        
        return 0 if self.tests_passed == self.tests_run else 1

def main():
    tester = HomelandAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())
