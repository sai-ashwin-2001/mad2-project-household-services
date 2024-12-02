import signup from './components/signup.js'
import login from './components/login.js'
import adminHome from './components/admin-home.js'
import Feedback from './components/feedback.js' // Import the feedback page component
import userHome from './components/user-home.js'
import professionalHome from './components/professional-home.js'


const routes = [
{ path: '/', component: signup, name: 'signup' },
{ path: '/login', component: login, name: 'login' },
{ path: '/admin-home', component: adminHome, name: 'admin-home' },
{
  path: "/feedback/:orderId",
  name: "feedback",
  component: Feedback,
  props: (route) => ({
      orderId: route.params.orderId,
      feedbackContext: route.params.feedbackContext || "user_to_professional",
  }),
},
{ path: '/user-home', component: userHome, name: 'user-home' },
{ path: '/professional-home', component: professionalHome, name: 'professional-home' },
]

const router = new VueRouter({
  mode: 'history',
    routes,
});

// Navigation guard to check authentication
router.beforeEach((to, from, next) => {
    const isAuthenticated = localStorage.getItem('auth-token') !== null;
    const isAdmin = localStorage.getItem('user-role') === 'admin';
    
    // Check if the route requires authentication
    if (to.meta.requiresAuth) {
      // Check if the user is authenticated
    if (isAuthenticated) {
        // Check if the route is restricted to admin only
        if (to.meta.isAdmin && isAdmin) {
          next(); // Allow access to the route
        } else if (!to.meta.isAdmin) {
          next(); // Allow access to the route for non-admin users
        } else {
          // Redirect to unauthorized page
        next('/unauthorized');
        }
    } else {
        // Redirect to login page
        next('/login');
    }
    } else {
      next(); // Allow access to public routes
    }
});  

export default router;