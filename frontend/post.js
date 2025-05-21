const BASE_URL = 'http://localhost:3000';
const token = localStorage.getItem('token');
let currentUser = null;

if (!token) {
  window.location.href = 'login.html';
} else {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    currentUser = { username: payload.username, name: payload.name || payload.username };
  } catch (e) {
    console.error('Error parsing token:', e);
  }
}

const logoutBtn = document.getElementById('logout');
const allPostsBtn = document.getElementById('allPostsBtn');
const postForm = document.getElementById('postForm');
const fileInput = document.getElementById('image');
const fileNameSpan = document.getElementById('fileName');
const myPostsContainer = document.getElementById('myPosts');
const headerTitle = document.querySelector('h1');


if (currentUser && currentUser.name) {
  headerTitle.innerHTML = `<i class="fab fa-twitter"></i> ${currentUser.name}'s Posts`;
}


document.addEventListener('DOMContentLoaded', () => {
  if (token) {
    fetchMyPosts();
  }
});

logoutBtn.addEventListener('click', logout);
allPostsBtn.addEventListener('click', () => window.location.href = 'all-post.html');
postForm.addEventListener('submit', createPost);
fileInput.addEventListener('change', updateFileName);

function updateFileName() {
  fileNameSpan.textContent = fileInput.files.length > 0 ? fileInput.files[0].name : '';
}

function logout() {
  localStorage.removeItem('token');
  window.location.href = 'login.html';
}

async function createPost(event) {
  event.preventDefault();
  const text = document.getElementById('text').value.trim();
  if (!text) {
    alert('Please enter some text for your post');
    return;
  }
  
  const formData = new FormData();
  formData.append('text', text);
  if (fileInput.files.length > 0) formData.append('image', fileInput.files[0]);

  try {
    const submitBtn = postForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Posting...';

    await axios.post(`${BASE_URL}/posts`, formData, {
      headers: { 'Content-Type': 'multipart/form-data', 'Authorization': token }
    });
    
    postForm.reset();
    fileNameSpan.textContent = '';
    fetchMyPosts();

    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Post';
  } catch (error) {
    console.error('Error creating post:', error);
    alert('Failed to create post: ' + (error.response?.data?.message || error.message));

    const submitBtn = postForm.querySelector('button[type="submit"]');
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Post';
  }
}

async function fetchMyPosts() {
  try {
    const response = await axios.get(`${BASE_URL}/my-posts`, {
      headers: { 'Authorization': token }
    });
    displayPosts(response.data);
  } catch (error) {
    console.error('Error fetching posts:', error);
    myPostsContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <p>Failed to load posts. Please try again later.</p>
        <button onclick="fetchMyPosts()" class="btn" style="margin-top: 15px;">
          <i class="fas fa-sync-alt"></i> Retry
        </button>
      </div>
    `;
  }
}

function displayPosts(posts) {
  if (posts.length === 0) {
    myPostsContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">
          <i class="far fa-newspaper"></i>
        </div>
        <p>You haven't created any posts yet</p>
      </div>
    `;
    return;
  }

  myPostsContainer.innerHTML = '';
  posts.forEach(post => {
    const postElement = document.createElement('div');
    postElement.className = 'post-card';
    const postDate = new Date(post.created_at).toLocaleString();
    const imageUrl = post.image ? `${BASE_URL}/${post.image.replace(/\\/g, '/')}` : '';
    postElement.innerHTML = `
      <div class="post-header">
        <div class="post-avatar">
          ${post.profile_pic ? 
            `<img src="${BASE_URL}/${post.profile_pic.replace(/\\/g, '/')}" alt="Profile" class="profile-pic">` : 
            `<i class="fas fa-user"></i>`
          }
        </div>
        <div>
          <div class="post-user">${currentUser ? currentUser.name : 'You'}</div>
          <div class="post-time">${postDate}</div>
        </div>
      </div>
      <div class="post-content">${post.text}</div>
      ${imageUrl ? `
        <div class="post-image-container">
          <img src="${imageUrl}" class="post-image" alt="Post image" onerror="this.style.display='none'">
        </div>` : ''
      }
      <div class="post-actions">
        <div class="post-action" onclick="toggleLike('${post.id}')">
          <i class="far fa-heart"></i>
          <span>${post.likes || 0} Likes</span>
        </div>
        <div class="post-action">
          <i class="far fa-comment"></i>
          <span>Comment</span>
        </div>
      </div>
    `;
    myPostsContainer.appendChild(postElement);
  });
}

window.toggleLike = async function(postId) {
  try {
    await axios.post(`${BASE_URL}/posts/${postId}/like`, {}, {
      headers: { 'Authorization': token }
    });
    fetchMyPosts(); 
  } catch (error) {
    console.error('Error toggling like:', error);
    alert('Failed to like/unlike the post: ' + (error.response?.data?.message || error.message));
  }
};





