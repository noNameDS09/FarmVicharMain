# TODO: Fix Login Stuck Issue

- [x] Add debug logs in app/_layout.tsx checkLoginStatus to verify token storage and state updates
- [x] Modify LoginForm.tsx to ensure onLoginSuccess callback is properly triggered and remove router.replace("/") to avoid navigation conflicts
- [ ] Test login flow to confirm app navigates to main screen after successful login
- [ ] If needed, add force re-render or state synchronization in root layout
