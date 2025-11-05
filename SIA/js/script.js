// Admin Login Modal Functionality
document.addEventListener('DOMContentLoaded', function() {
  // Get modal elements
  const adminLoginLink = document.getElementById('admin-login-link');
  const modal = document.getElementById('admin-login-modal');
  const closeBtn = document.querySelector('.close');
  const loginForm = document.getElementById('admin-login-form');
  
  // Open modal when admin login link is clicked
  if (adminLoginLink) {
    adminLoginLink.addEventListener('click', function(e) {
      e.preventDefault();
      if (modal) {
        modal.style.display = 'block';
      }
    });
  }
  
  // Close modal when X is clicked
  if (closeBtn) {
    closeBtn.addEventListener('click', function() {
      if (modal) {
        modal.style.display = 'none';
      }
    });
  }
  
  // Close modal when clicking outside of it
  window.addEventListener('click', function(e) {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });
  
  // Handle login form submission
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const username = document.getElementById('admin-username').value;
      const password = document.getElementById('admin-password').value;
      
      // Here you would typically send this to your server for authentication
      // For demonstration, we'll just log to console
      console.log('Admin login attempt:', { username, password });
      
      // In a real implementation, you would redirect to admin page after successful login
      // window.location.href = 'admin-dashboard.html';
      
      // For now, just close the modal and show an alert
      modal.style.display = 'none';
      alert('Login functionality would be implemented here. In a real application, this would redirect to the admin dashboard.');
    });
  }
});