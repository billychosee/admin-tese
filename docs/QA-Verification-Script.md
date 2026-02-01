# TESE Admin Portal - QA Verification Script

## Overview

This document provides a comprehensive functional testing checklist for the TESE Admin Portal. All tests focus on functional verification, not UI styling or design.

---

## 1. Authentication Tests

### 1.1 Admin Registration

| Step | Action                                          | Expected Result                                 |
| ---- | ----------------------------------------------- | ----------------------------------------------- |
| 1    | Navigate to `/register`                         | Registration page loads successfully            |
| 2    | Fill in required fields (email, password, name) | Fields accept input correctly                   |
| 3    | Submit registration form                        | Account created, redirect to login or dashboard |
| 4    | Verify in mock data storage                     | New admin record appears in mock data           |

### 1.2 Admin Login

| Step | Action                            | Expected Result                     |
| ---- | --------------------------------- | ----------------------------------- |
| 1    | Navigate to `/login`              | Login page loads successfully       |
| 2    | Enter valid credentials           | Credentials accepted                |
| 3    | Click login button                | Token stored, redirect to dashboard |
| 4    | Check localStorage/sessionStorage | Auth token is persisted             |

### 1.3 Protected Routes - Unauthenticated Access

| Step | Action                                          | Expected Result        |
| ---- | ----------------------------------------------- | ---------------------- |
| 1    | Attempt to access `/dashboard` without login    | Redirected to `/login` |
| 2    | Attempt to access `/categories` without login   | Redirected to `/login` |
| 3    | Attempt to access `/creators` without login     | Redirected to `/login` |
| 4    | Attempt to access `/videos` without login       | Redirected to `/login` |
| 5    | Attempt to access `/transactions` without login | Redirected to `/login` |

### 1.4 Token Handling

| Step | Action                            | Expected Result                       |
| ---- | --------------------------------- | ------------------------------------- |
| 1    | Login and verify token is set     | Auth token present in storage         |
| 2    | Manually clear token from storage | App redirects to login on next action |
| 3    | Test API calls with valid token   | Requests succeed (mock)               |
| 4    | Test API calls with invalid token | Requests fail gracefully              |

### 1.5 Logout

| Step | Action                            | Expected Result            |
| ---- | --------------------------------- | -------------------------- |
| 1    | While logged in, click logout     | Token cleared from storage |
| 2    | Attempt to access protected route | Redirected to login        |
| 3    | Verify user is on login page      | Login page displayed       |

---

## 2. Sidebar & Navigation Tests

### 2.1 Sidebar Collapsible Functionality

| Step | Action                               | Expected Result                   |
| ---- | ------------------------------------ | --------------------------------- |
| 1    | Load dashboard with sidebar expanded | Full logo + labels visible        |
| 2    | Click sidebar toggle                 | Sidebar collapses to icons only   |
| 3    | Verify collapsed state               | Only icons + favicon visible      |
| 4    | Click toggle again                   | Sidebar expands                   |
| 5    | Refresh page                         | Collapsed/expanded state persists |

### 2.2 Theme Toggle (Dark/Light Mode)

| Step | Action                        | Expected Result                   |
| ---- | ----------------------------- | --------------------------------- |
| 1    | Load any page                 | Default dark mode active          |
| 2    | Click theme toggle in top bar | Switches to light mode            |
| 3    | Verify theme change           | All components reflect light mode |
| 4    | Click toggle again            | Returns to dark mode              |
| 5    | Refresh page                  | Theme preference persists         |

### 2.3 Navigation Menu Items

| Step | Action                               | Expected Result              |
| ---- | ------------------------------------ | ---------------------------- |
| 1    | Click "Dashboard" in sidebar         | Redirects to `/dashboard`    |
| 2    | Click "Categories" in sidebar        | Redirects to `/categories`   |
| 3    | Click "Content Creators" in sidebar  | Redirects to `/creators`     |
| 4    | Click "Videos" in sidebar            | Redirects to `/videos`       |
| 5    | Click "Featured Creators" in sidebar | Redirects to `/featured`     |
| 6    | Click "Transactions" in sidebar      | Redirects to `/transactions` |
| 7    | Click "Devices" in sidebar           | Redirects to `/devices`      |

---

## 3. Dashboard Tests

### 3.1 Metrics Display

| Step | Action                          | Expected Result                 |
| ---- | ------------------------------- | ------------------------------- |
| 1    | Navigate to `/dashboard`        | Dashboard loads                 |
| 2    | Verify all metric cards visible | Cards display correct mock data |
| 3    | Check Total Creators card       | Value matches mock data count   |
| 4    | Check Total Videos card         | Value matches mock data count   |
| 5    | Check Total Views card          | Value matches mock data count   |
| 6    | Check Total Channels card       | Value matches mock data count   |

### 3.2 Metrics Card Navigation

| Step | Action                             | Expected Result              |
| ---- | ---------------------------------- | ---------------------------- |
| 1    | Click "Total Creators" metric card | Navigates to `/creators`     |
| 2    | Click "Total Videos" metric card   | Navigates to `/videos`       |
| 3    | Click "Total Channels" metric card | Navigates to `/creators`     |
| 4    | Click "Total Views" metric card    | Navigates to `/videos`       |
| 5    | Verify URL changes                 | Correct page URL displayed   |
| 6    | Navigate back to dashboard         | Dashboard reloaded correctly |

### 3.4 Creator Activity Navigation

| Step | Action                                  | Expected Result           |
| ---- | --------------------------------------- | ------------------------- |
| 1    | Navigate to `/dashboard`                | Dashboard loads           |
| 2    | Find "Creator Activity" section        | Activity items visible    |
| 3    | Click on any activity item              | Navigates to `/creators`  |
| 4    | Verify URL changes                      | `/creators` page displays |

### 3.5 Recent Transactions Navigation

| Step | Action                                  | Expected Result              |
| ---- | --------------------------------------- | ---------------------------- |
| 1    | Navigate to `/dashboard`                | Dashboard loads              |
| 2    | Find "Recent Transactions" section     | Transactions table visible   |
| 3    | Click "View All" button                | Navigates to `/transactions` |
| 4    | Click on any transaction row            | Navigates to `/transactions` |
| 5    | Verify URL changes                      | Transactions page displays   |

### 3.6 Charts Loading

| Step | Action                   | Expected Result                |
| ---- | ------------------------ | ------------------------------ |
| 1    | Navigate to `/dashboard` | Charts load with mock data     |
| 2    | Verify chart containers  | Charts render with data points |
| 3    | Check data labels        | Labels match mock data values  |

### 3.3 Async Loaders

| Step | Action                   | Expected Result                    |
| ---- | ------------------------ | ---------------------------------- |
| 1    | Hard refresh dashboard   | Skeleton loaders appear briefly    |
| 2    | Wait for data fetch      | Content replaces skeletons         |
| 3    | Simulate slow connection | Loaders display until data arrives |

### 3.4 Empty State Handling

| Step | Action                        | Expected Result               |
| ---- | ----------------------------- | ----------------------------- |
| 1    | Mock API to return empty data | Empty state message displayed |
| 2    | Verify empty state UI         | User-friendly message shown   |

---

## 4. Categories Management Tests

### 4.1 Category Listing

| Step | Action                    | Expected Result                  |
| ---- | ------------------------- | -------------------------------- |
| 1    | Navigate to `/categories` | Category list loads              |
| 2    | Verify all columns        | Name, Status, Actions visible    |
| 3    | Check pagination          | Works if data exceeds page limit |

### 4.2 Create Category

| Step | Action                      | Expected Result                |
| ---- | --------------------------- | ------------------------------ |
| 1    | Click "Add Category" button | Modal/form opens               |
| 2    | Enter category name         | Input accepts text             |
| 3    | Submit form                 | Loader appears during creation |
| 4    | Verify creation             | New category appears in list   |
| 5    | Check mock data             | Category saved to mock storage |

### 4.3 Edit Category

| Step | Action                        | Expected Result                    |
| ---- | ----------------------------- | ---------------------------------- |
| 1    | Click edit button on category | Edit modal opens with current data |
| 2    | Modify category name          | Input accepts changes              |
| 3    | Save changes                  | Loader appears during update       |
| 4    | Verify update                 | List reflects changes              |

### 4.4 Delete Category

| Step | Action              | Expected Result                |
| ---- | ------------------- | ------------------------------ |
| 1    | Click delete button | Confirmation modal appears     |
| 2    | Confirm deletion    | Loader appears during deletion |
| 3    | Verify deletion     | Category removed from list     |
| 4    | Check mock data     | Category removed from storage  |

### 4.5 Status Toggle

| Step | Action                          | Expected Result                  |
| ---- | ------------------------------- | -------------------------------- |
| 1    | Click status toggle on category | Status changes (active/inactive) |
| 2    | Verify UI update                | Badge/color changes accordingly  |
| 3    | Refresh page                    | Status persists                  |

---

## 5. Content Creators Tests

### 5.1 Creator Listing - List/Grid Toggle

| Step | Action                   | Expected Result                     |
| ---- | ------------------------ | ----------------------------------- |
| 1    | Navigate to `/creators`  | Creators list loads in default view |
| 2    | Click grid toggle button | View switches to grid layout        |
| 3    | Click list toggle button | View switches to list layout        |
| 4    | Refresh page             | Toggle preference persists          |

### 5.2 Filters and Search

| Step | Action              | Expected Result                 |
| ---- | ------------------- | ------------------------------- |
| 1    | Type in search box  | List filters by creator name    |
| 2    | Apply status filter | List shows only matching status |
| 3    | Clear filters       | All creators displayed          |
| 4    | Test online filter  | Only online creators shown      |

### 5.3 Creator Detail View

| Step | Action                 | Expected Result                 |
| ---- | ---------------------- | ------------------------------- |
| 1    | Click on a creator     | Detail page/modal opens         |
| 2    | Verify personal info   | Name, email, phone displayed    |
| 3    | Verify channel info    | Channel name, subscribers shown |
| 4    | Verify videos summary  | Video count, total views shown  |
| 5    | Verify SmatPay details | Merchant status, balance shown  |

### 5.4 Admin Actions - Approve/Reject

| Step | Action                 | Expected Result                            |
| ---- | ---------------------- | ------------------------------------------ |
| 1    | Select pending creator | Action buttons enabled                     |
| 2    | Click Approve          | Loader appears, status changes to approved |
| 3    | Click Reject           | Confirmation modal appears                 |
| 4    | Confirm rejection      | Loader appears, status changes to rejected |
| 5    | Verify list update     | Creator status updated in list             |

### 5.5 Admin Actions - Activate/Deactivate

| Step | Action                             | Expected Result                    |
| ---- | ---------------------------------- | ---------------------------------- |
| 1    | Click Activate on inactive creator | Loader, creator becomes active     |
| 2    | Click Deactivate on active creator | Confirmation modal appears         |
| 3    | Confirm deactivation               | Loader, creator becomes inactive   |
| 4    | Verify status badges               | Visual indicators update correctly |

---

## 6. Videos Tests

### 6.1 Video Listing with Toggles

| Step | Action                   | Expected Result            |
| ---- | ------------------------ | -------------------------- |
| 1    | Navigate to `/videos`    | Video list loads           |
| 2    | Toggle between list/grid | Layout changes accordingly |
| 3    | Refresh page             | Toggle preference persists |

### 6.2 Filters

| Step | Action              | Expected Result                |
| ---- | ------------------- | ------------------------------ |
| 1    | Apply "Paid" filter | Only paid videos shown         |
| 2    | Apply "Free" filter | Only free videos shown         |
| 3    | Apply status filter | Only videos with status shown  |
| 4    | Combine filters     | Multiple filters work together |

### 6.3 Admin Actions - Delete

| Step | Action                | Expected Result                 |
| ---- | --------------------- | ------------------------------- |
| 1    | Click delete on video | Confirmation modal appears      |
| 2    | Confirm deletion      | Loader, video removed from list |
| 3    | Verify mock data      | Video marked as deleted         |

### 6.4 Admin Actions - Deactivate/Suspend

| Step | Action               | Expected Result                   |
| ---- | -------------------- | --------------------------------- |
| 1    | Click deactivate     | Video status changes to inactive  |
| 2    | Click suspend        | Video status changes to suspended |
| 3    | Verify status badges | Visual indicators update          |

### 6.5 Admin Actions - Promote

| Step | Action                      | Expected Result                |
| ---- | --------------------------- | ------------------------------ |
| 1    | Click "Promote to Featured" | Video marked as featured       |
| 2    | Click "Promote to Banner"   | Video added to banner rotation |
| 3    | Verify status               | Promoted status visible in UI  |

---

## 7. Featured Creators Tests

### 7.1 List/Grid Toggle

| Step | Action                  | Expected Result        |
| ---- | ----------------------- | ---------------------- |
| 1    | Navigate to `/featured` | Featured creators load |
| 2    | Toggle between views    | Layout changes         |
| 3    | Refresh page            | Preference persists    |

### 7.2 Reordering (Mock)

| Step | Action                | Expected Result           |
| ---- | --------------------- | ------------------------- |
| 1    | Drag and drop creator | New order accepted        |
| 2    | Verify order change   | Creators in new positions |
| 3    | Refresh page          | New order persists        |

### 7.3 Enable/Disable Featured Status

| Step | Action                            | Expected Result               |
| ---- | --------------------------------- | ----------------------------- |
| 1    | Click disable on featured creator | Creator removed from featured |
| 2    | Click enable on non-featured      | Creator added to featured     |
| 3    | Verify list update                | Changes reflected immediately |

---

## 8. Transactions Tests

### 8.1 Transaction List Loading

| Step | Action                      | Expected Result                       |
| ---- | --------------------------- | ------------------------------------- |
| 1    | Navigate to `/transactions` | Transaction list loads                |
| 2    | Verify all columns          | Date, Creator, Amount, Status visible |
| 3    | Check pagination            | Works correctly                       |

### 8.2 Filters

| Step | Action                   | Expected Result                   |
| ---- | ------------------------ | --------------------------------- |
| 1    | Filter by date range     | Only transactions in range shown  |
| 2    | Filter by creator        | Only creator's transactions shown |
| 3    | Filter by status         | Only matching status shown        |
| 4    | Filter by payment method | Only matching method shown        |
| 5    | Combine filters          | Multiple filters work together    |

### 8.3 Admin Actions - Override Payment Status

| Step | Action                  | Expected Result        |
| ---- | ----------------------- | ---------------------- |
| 1    | Click "Override Status" | Modal opens            |
| 2    | Select new status       | Status selected        |
| 3    | Confirm override        | Loader, status updated |
| 4    | Verify in list          | New status visible     |

### 8.4 Admin Actions - Mark Refunded

| Step | Action                | Expected Result                     |
| ---- | --------------------- | ----------------------------------- |
| 1    | Click "Mark Refunded" | Confirmation modal                  |
| 2    | Confirm action        | Loader, transaction marked refunded |
| 3    | Verify status badge   | Refunded badge shown                |

### 8.5 Admin Actions - Flag Suspicious

| Step | Action                  | Expected Result        |
| ---- | ----------------------- | ---------------------- |
| 1    | Click "Flag Suspicious" | Modal or inline input  |
| 2    | Add reason/notes        | Notes accepted         |
| 3    | Confirm flag            | Transaction flagged    |
| 4    | Verify visual indicator | Flagged status visible |

---

## 9. Device & Location Awareness Tests

### 9.1 Device List Display

| Step | Action                    | Expected Result                |
| ---- | ------------------------- | ------------------------------ |
| 1    | Navigate to `/devices`    | Device list loads              |
| 2    | Verify device information | Device type, browser, OS shown |
| 3    | Check IP addresses        | IP addresses displayed         |
| 4    | Check locations           | Geographic locations shown     |
| 5    | Check timestamps          | Last active times shown        |

### 9.2 Max Device Rule Display

| Step | Action                       | Expected Result                  |
| ---- | ---------------------------- | -------------------------------- |
| 1    | View device list             | Max device limit shown (e.g., 2) |
| 2    | Count current devices        | Current count vs limit displayed |
| 3    | Verify warning if over limit | Visual indicator when over limit |

### 9.3 Force Logout

| Step | Action                         | Expected Result             |
| ---- | ------------------------------ | --------------------------- |
| 1    | Click "Force Logout" on device | Confirmation modal appears  |
| 2    | Confirm action                 | Device logged out (mock)    |
| 3    | Verify device status           | Device marked as logged out |

---

## 10. Async / Loader Verification

### 10.1 CRUD Action Loaders

| Step | Action                | Expected Result                 |
| ---- | --------------------- | ------------------------------- |
| 1    | Create new item       | Loader displays during API call |
| 2    | Update existing item  | Loader displays during API call |
| 3    | Delete item           | Loader displays during API call |
| 4    | Verify loader removal | Loader hides after completion   |

### 10.2 Skeleton Loading

| Step | Action                 | Expected Result                |
| ---- | ---------------------- | ------------------------------ |
| 1    | Navigate to any page   | Skeletons appear while loading |
| 2    | Verify skeleton types  | Match expected content layout  |
| 3    | Check skeleton removal | Replaced by actual content     |

### 10.3 Empty States

| Step | Action                   | Expected Result               |
| ---- | ------------------------ | ----------------------------- |
| 1    | Mock API to return empty | Empty state message displayed |
| 2    | Check empty state design | User-friendly message + icon  |
| 3    | Verify actionability     | Add new item button available |

### 10.4 Retry on Failure

| Step | Action              | Expected Result              |
| ---- | ------------------- | ---------------------------- |
| 1    | Mock API to fail    | Error message displayed      |
| 2    | Verify retry option | Retry button appears         |
| 3    | Click retry         | API called again, data loads |

---

## 11. Security Checks (Frontend)

### 11.1 Protected Routes

| Step | Action                                         | Expected Result             |
| ---- | ---------------------------------------------- | --------------------------- |
| 1    | Try direct URL to protected route without auth | Redirected to login         |
| 2    | Try direct URL with expired/invalid token      | Redirected to login         |
| 3    | Try to access route with insufficient role     | Access denied or redirected |

### 11.2 Role-Based UI Restrictions

| Step | Action                    | Expected Result                 |
| ---- | ------------------------- | ------------------------------- |
| 1    | Login as admin            | All admin features visible      |
| 2    | Verify admin-only actions | Delete, Approve, etc. available |

### 11.3 Destructive Action Confirmations

| Step | Action                   | Expected Result               |
| ---- | ------------------------ | ----------------------------- |
| 1    | Click delete on any item | Confirmation modal appears    |
| 2    | Click outside modal      | Modal closes, no action taken |
| 3    | Click cancel             | Modal closes, no action taken |
| 4    | Confirm deletion         | Action proceeds               |

### 11.4 Token Handling

| Step | Action                    | Expected Result                    |
| ---- | ------------------------- | ---------------------------------- |
| 1    | Login and inspect storage | Token properly stored              |
| 2    | Inspect API requests      | Authorization header set correctly |
| 3    | Token expiration handling | Redirected to login when expired   |

---

## 12. Overall System Flow Tests

### 12.1 End-to-End Registration Flow

| Step | Action                       | Expected Result                      |
| ---- | ---------------------------- | ------------------------------------ |
| 1    | Navigate to `/register`      | Registration page loads              |
| 2    | Fill valid registration data | All fields validated                 |
| 3    | Submit form                  | Account created, redirected to login |
| 4    | Login with new credentials   | Dashboard accessible                 |
| 5    | Verify user session          | Authenticated state confirmed        |

### 12.2 End-to-End CRUD Flow

| Step | Action                 | Expected Result            |
| ---- | ---------------------- | -------------------------- |
| 1    | Navigate to Categories | Category list loads        |
| 2    | Create new category    | Category appears in list   |
| 3    | Edit category          | Changes reflected in list  |
| 4    | Toggle status          | Status changes correctly   |
| 5    | Delete category        | Category removed from list |
| 6    | Refresh page           | Changes persist            |

### 12.3 Persistence Tests

| Step | Action                   | Expected Result         |
| ---- | ------------------------ | ----------------------- |
| 1    | Toggle sidebar collapsed | State changes           |
| 2    | Toggle theme             | State changes           |
| 3    | Toggle list/grid view    | State changes           |
| 4    | Refresh each page        | All preferences persist |
| 5    | Logout and login         | Preferences retained    |

### 12.4 Mock Data Consistency

| Step | Action                     | Expected Result                      |
| ---- | -------------------------- | ------------------------------------ |
| 1    | Create item in one section | Item available in related sections   |
| 2    | Update item                | Changes reflect across all views     |
| 3    | Delete item                | Item removed from all references     |
| 4    | Check related data         | Consistent state across mock storage |

---

## Testing Notes

### Environment Requirements

- Next.js development server running
- Mock API service operational
- Browser with console open for error monitoring

### Mock Data Reset

If testing causes inconsistent state:

1. Clear browser localStorage/sessionStorage
2. Hard refresh the page
3. Restart development server if needed

### Priority Levels

- **P0 (Critical)**: Authentication, Protected Routes, Core CRUD
- **P1 (High)**: Admin Actions, Filters, Search
- **P2 (Medium)**: UI Toggles, Persistence, Empty States
- **P3 (Low)**: Edge Cases, Retry Logic

### Bug Reporting Format

When finding bugs, document:

1. Page/Feature
2. Step Number
3. Expected Result
4. Actual Result
5. Screenshot/Console Logs
6. Browser/Device Info
