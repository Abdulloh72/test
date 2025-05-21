// document.addEventListener('DOMContentLoaded', function() {
//     const signupForm = document.getElementById('signupForm');
//     const profilePicInput = document.getElementById('profilePic');
//     const profilePreview = document.getElementById('profilePreview');
//     const errorElements = {
//       name: document.getElementById('nameError'),
//       username: document.getElementById('usernameError'),
//       password: document.getElementById('passwordError')
//     };
  
  
//     profilePicInput.addEventListener('change', function() {
//       if (this.files && this.files[0]) {
//         const reader = new FileReader();
        
//         reader.onload = function(e) {
//           profilePreview.src = e.target.result;
//           profilePreview.style.display = 'block';
//         }
        
//         reader.readAsDataURL(this.files[0]);
//       }
//     });
  

//     signupForm.addEventListener('submit', async (event) => {
//       event.preventDefault();
      

//       Object.values(errorElements).forEach(el => {
//         el.style.display = 'none';
//         el.textContent = '';
//       });
  
   
//       const name = document.getElementById('name').value.trim();
//       const username = document.getElementById('username').value.trim();
//       const password = document.getElementById('password').value.trim();
      
//       if (!name) {
//         showError('name', 'Please enter your full name');
//         return;
//       }
      
//       if (!username) {
//         showError('username', 'Please choose a username');
//         return;
//       }
      
//       if (password.length < 6) {
//         showError('password', 'Password must be at least 6 characters');
//         return;
//       }
  
      
//       const formData = new FormData();
//       formData.append('name', name);
//       formData.append('username', username);
//       formData.append('password', password);
      
//       if (profilePicInput.files[0]) {
//         formData.append('profilePic', profilePicInput.files[0]);
//       }
  
//       try {
      
//         const submitBtn = signupForm.querySelector('button[type="submit"]');
//         submitBtn.disabled = true;
//         submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';
  
      
//         const response = await axios.post('http://localhost:3000/signup', formData, {
//           headers: { 'Content-Type': 'multipart/form-data' },
//         });
  
        
//         alert('Account created successfully! Welcome ' + name);
//         window.location.href = 'login.html';
        
//       } catch (error) {
//         console.error('Signup error:', error);
        
        
//         const submitBtn = signupForm.querySelector('button[type="submit"]');
//         submitBtn.disabled = false;
//         submitBtn.textContent = 'Sign Up';
  
        
//         if (error.response) {
//           if (error.response.status === 409) {
//             showError('username', 'Username already taken');
//           } else {
//             alert('Sign up failed: ' + (error.response.data.message || 'Please try again'));
//           }
//         } else {
//           alert('Network error. Please check your connection and try again.');
//         }
//       }
//     });
  
    
//     function showError(field, message) {
//       errorElements[field].textContent = message;
//       errorElements[field].style.display = 'block';
//       document.getElementById(field).focus();
//     }
//   });


document.addEventListener('DOMContentLoaded', function() {
  const signupForm = document.getElementById('signupForm');
  const profilePicInput = document.getElementById('profilePic');
  const profilePreview = document.getElementById('profilePreview');
  const errorElements = {
    name: document.getElementById('nameError'),
    username: document.getElementById('usernameError'),
    password: document.getElementById('passwordError')
  };

  // Profil rasmni ko'rsatish
  profilePicInput.addEventListener('change', function() {
    if (this.files && this.files[0]) {
      const reader = new FileReader();
      
      reader.onload = function(e) {
        profilePreview.src = e.target.result;
        profilePreview.style.display = 'block';
      };
      
      reader.readAsDataURL(this.files[0]);
    }
  });

  // Ro‘yxatdan o‘tish
  signupForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Xatoliklarni tozalash
    Object.values(errorElements).forEach(el => {
      el.style.display = 'none';
      el.textContent = '';
    });

    const name = document.getElementById('name').value.trim();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!name) {
      showError('name', 'Please enter your full name');
      return;
    }
    if (!username) {
      showError('username', 'Please choose a username');
      return;
    }
    if (password.length < 6) {
      showError('password', 'Password must be at least 6 characters');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('username', username);
    formData.append('password', password);
    if (profilePicInput.files[0]) {
      formData.append('profilePic', profilePicInput.files[0]);
    }

    try {
      const submitBtn = signupForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';

      const response = await axios.post('http://localhost:3000/signup', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      alert('Account created successfully! Welcome ' + name);
      window.location.href = 'login.html';
    } catch (error) {
      console.error('Signup error:', error);

      const submitBtn = signupForm.querySelector('button[type="submit"]');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Sign Up';

      if (error.response) {
        if (error.response.status === 409) {
          showError('username', 'Username already taken');
        } else {
          alert('Sign up failed: ' + (error.response.data.message || 'Please try again'));
        }
      } else {
        alert('Network error. Please check your connection and try again.');
      }
    }
  });

  function showError(field, message) {
    errorElements[field].textContent = message;
    errorElements[field].style.display = 'block';
    document.getElementById(field).focus();
  }
});
