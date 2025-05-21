document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    const errorElements = {
      username: document.getElementById('usernameError'),
      password: document.getElementById('passwordError')
    };
  
   
    togglePassword.addEventListener('click', function() {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      this.classList.toggle('fa-eye-slash');
    });
  
  
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      
    
      Object.values(errorElements).forEach(el => {
        el.style.display = 'none';
        el.textContent = '';
      });
  
      
      const username = document.getElementById('username').value.trim();
      const password = document.getElementById('password').value.trim();
      
     
      if (!username) {
        showError('username', 'Please enter your username');
        return;
      }
      
      if (!password) {
        showError('password', 'Please enter your password');
        return;
      }
  
      try {
       
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
  
       
        const response = await axios.post('http://localhost:3000/login', { 
          username, 
          password 
        });
  
       
        localStorage.setItem('token', response.data.token);
        window.location.href = 'post.html';
        
      } catch (error) {
        console.error('Login error:', error);
        
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Log In';
  
       
        if (error.response) {
          if (error.response.status === 401) {
            showError('password', 'Invalid username or password');
          } else {
            showError('username', 'Login failed. Please try again.');
          }
        } else {
          showError('username', 'Network error. Please check your connection.');
        }
      }
    });
  
   
    function showError(field, message) {
      errorElements[field].textContent = message;
      errorElements[field].style.display = 'block';
      document.getElementById(field).focus();
    }
  });