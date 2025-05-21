const token = localStorage.getItem('token');

const createPostBtn = document.getElementById('createPost');
const logoutBtn = document.getElementById('logout');
const postsContainer = document.getElementById('postsContainer');

createPostBtn.addEventListener('click', goToCreatePost);
logoutBtn.addEventListener('click', logout);

if (!token) {
  window.location.href = 'login.html';
}

function goToCreatePost() {
  window.location.href = 'post.html';
}

function logout() {
  localStorage.removeItem('token');
  window.location.href = 'login.html';
}

let allPosts = [];

async function fetchAllPosts() {
  try {
    postsContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">
          <i class="fas fa-spinner fa-spin"></i>
        </div>
        <p>Loading posts...</p>
      </div>
    `;

    const response = await axios.get('http://localhost:3000/posts', { 
      headers: { 'Authorization': token } 
    });
    
    allPosts = response.data;
    displayPosts(allPosts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    postsContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <p>Failed to load posts. Please try again later.</p>
        <button onclick="fetchAllPosts()" class="btn" style="margin-top: 15px;">
          <i class="fas fa-sync-alt"></i> Retry
        </button>
      </div>
    `;
  }
}

async function addComment(postId, text, postElement) {
  try {
    await axios.post(`http://localhost:3000/posts/${postId}/comments`, 
      { text },
      { headers: { 'Authorization': token } }
    );
    
    fetchAllPosts();
  } catch (error) {
    console.error('Error adding comment:', error);
    alert('Failed to add comment: ' + (error.response?.data?.message || error.message));
  }
}

function displayPosts(posts) {
  if (posts.length === 0) {
    postsContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">
          <i class="far fa-newspaper"></i>
        </div>
        <p>No posts found. Be the first to post!</p>
      </div>
    `;
    return;
  }

  postsContainer.innerHTML = '';
  
  posts.forEach(post => {
    const postElement = document.createElement('div');
    postElement.className = 'post-card';
    
    const postDate = new Date(post.created_at).toLocaleString();
    const imageUrl = post.image ? `http://localhost:3000/${post.image.replace(/\\/g, '/')}` : '';
    const profilePicUrl = post.profile_pic ? `http://localhost:3000/${post.profile_pic.replace(/\\/g, '/')}` : '';
    const isLiked = post.liked_by_user || false;
    
    postElement.innerHTML = `
      <div class="post-header">
        <div class="post-avatar">
          ${profilePicUrl ? 
            `<img src="${profilePicUrl}" alt="Profile" class="profile-pic">` : 
            `<i class="fas fa-user"></i>`
          }
        </div>
        <div>
          <div class="post-user">${post.username}</div>
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
        <button class="like-btn ${isLiked ? 'liked' : ''}" onclick="toggleLike(${post.id}, this)">
          <i class="fas fa-heart"></i>
          <span>${post.likes || 0} Likes</span>
        </button>
      </div>
      <div class="comments-container">
        ${post.comments && post.comments.length > 0 ? `
          <div class="comments-list">
            ${post.comments.map(comment => `
              <div class="comment">
                <strong>${comment.username}</strong>: ${comment.text}
                <div class="comment-time">${new Date(comment.created_at).toLocaleString()}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}
        <div class="comment-form">
          <textarea class="comment-input" placeholder="Add a comment..." rows="1"></textarea>
          <button class="btn btn-comment" onclick="submitComment(${post.id}, this)">Post</button>
        </div>
      </div>
    `;
    
    postsContainer.appendChild(postElement);
  });
}

async function toggleLike(postId, button) {
  try {
    const postIndex = allPosts.findIndex(p => p.id === postId);
    if (postIndex === -1) return;

    const post = allPosts[postIndex];
    const wasLiked = post.liked_by_user;
    const currentLikes = post.likes || 0;
    
    post.liked_by_user = !wasLiked;
    post.likes = wasLiked ? currentLikes - 1 : currentLikes + 1;
    
    button.classList.toggle('liked');
    button.innerHTML = `
      <i class="fas fa-heart ${!wasLiked ? 'liked' : ''}"></i>
      <span>${post.likes} Likes</span>
    `;

    await axios.post(`http://localhost:3000/posts/${postId}/like`, {}, { 
      headers: { 'Authorization': token } 
    });

    fetchAllPosts();
  } catch (error) {
    console.error('Error toggling like:', error);
    fetchAllPosts();
    alert('Failed to like/unlike the post: ' + (error.response?.data?.message || error.message));
  }
}

function submitComment(postId, button) {
  const commentInput = button.previousElementSibling;
  const text = commentInput.value.trim();
  
  if (!text) {
    alert('Please enter a comment');
    return;
  }

  const postElement = button.closest('.post-card');
  addComment(postId, text, postElement);
  commentInput.value = '';
}

fetchAllPosts();
