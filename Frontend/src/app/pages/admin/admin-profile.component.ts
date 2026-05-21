import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import axios from 'axios';

export class AdminProfileComponent {
  private authService: AuthService;
  private toastService: ToastService;
  private currentUser: any = null;
  private formData = {
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: ''
  };
  private passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
  private loading: boolean = false;

  constructor(authService: AuthService, toastService: ToastService) {
    this.authService = authService;
    this.toastService = toastService;
  }

  async initialize(): Promise<void> {
    this.currentUser = this.authService.getCurrentUser();
    this.formData = {
      firstName: this.currentUser?.firstName || '',
      lastName: this.currentUser?.lastName || '',
      email: this.currentUser?.email || '',
      phoneNumber: this.currentUser?.phoneNumber || ''
    };
  }

  async updateProfile(): Promise<void> {
    this.loading = true;
    try {
      const response = await axios.put(
        `http://localhost:5289/api/admin/profile/${this.currentUser.userId}`,
        this.formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      this.currentUser = response.data;
      this.authService.setCurrentUser(response.data);
      this.toastService.success('Profile updated successfully!');
    } catch (error: any) {
      this.toastService.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      this.loading = false;
    }
  }

  async changePassword(): Promise<void> {
    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      this.toastService.error('Passwords do not match!');
      return;
    }

    if (this.passwordForm.newPassword.length < 8) {
      this.toastService.error('Password must be at least 8 characters!');
      return;
    }

    this.loading = true;
    try {
      await axios.post(
        `http://localhost:5289/api/admin/change-password/${this.currentUser.userId}`,
        {
          currentPassword: this.passwordForm.currentPassword,
          newPassword: this.passwordForm.newPassword
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      this.passwordForm = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      };
      this.toastService.success('Password changed successfully!');
    } catch (error: any) {
      this.toastService.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      this.loading = false;
    }
  }

  render(): string {
    return `
      <div class="profile-container">
        <div class="profile-header">
          <h1>👤 Profile Settings</h1>
          <p>Manage your account information and security</p>
        </div>

        <div class="profile-content">
          <!-- Profile Info Section -->
          <div class="profile-section">
            <div class="section-header">
              <h2>Personal Information</h2>
            </div>

            <form class="profile-form" onsubmit="window.updateAdminProfile(event)">
              <div class="form-row">
                <div class="form-group">
                  <label>First Name</label>
                  <input 
                    type="text" 
                    value="${this.formData.firstName}"
                    onchange="window.updateAdminFormField('firstName', this.value)"
                    placeholder="Enter first name"
                    required
                  >
                </div>
                <div class="form-group">
                  <label>Last Name</label>
                  <input 
                    type="text" 
                    value="${this.formData.lastName}"
                    onchange="window.updateAdminFormField('lastName', this.value)"
                    placeholder="Enter last name"
                    required
                  >
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Email</label>
                  <input 
                    type="email" 
                    value="${this.formData.email}"
                    onchange="window.updateAdminFormField('email', this.value)"
                    placeholder="Enter email"
                    required
                  >
                </div>
                <div class="form-group">
                  <label>Phone Number</label>
                  <input 
                    type="tel" 
                    value="${this.formData.phoneNumber}"
                    onchange="window.updateAdminFormField('phoneNumber', this.value)"
                    placeholder="Enter phone number"
                  >
                </div>
              </div>

              <button type="submit" class="btn btn-primary" ${this.loading ? 'disabled' : ''}>
                ${this.loading ? '⏳ Updating...' : '💾 Update Profile'}
              </button>
            </form>
          </div>

          <!-- Change Password Section -->
          <div class="profile-section">
            <div class="section-header">
              <h2>Change Password</h2>
              <p class="section-description">Ensure your account is using a strong password</p>
            </div>

            <form class="profile-form" onsubmit="window.changeAdminPassword(event)">
              <div class="form-group">
                <label>Current Password</label>
                <input 
                  type="password" 
                  onchange="window.updateAdminPasswordField('currentPassword', this.value)"
                  placeholder="Enter current password"
                  required
                >
              </div>

              <div class="form-group">
                <label>New Password</label>
                <input 
                  type="password" 
                  onchange="window.updateAdminPasswordField('newPassword', this.value)"
                  placeholder="Enter new password"
                  required
                >
                <small>Must be at least 8 characters with uppercase, lowercase, and number</small>
              </div>

              <div class="form-group">
                <label>Confirm Password</label>
                <input 
                  type="password" 
                  onchange="window.updateAdminPasswordField('confirmPassword', this.value)"
                  placeholder="Confirm new password"
                  required
                >
              </div>

              <button type="submit" class="btn btn-danger" ${this.loading ? 'disabled' : ''}>
                ${this.loading ? '⏳ Changing...' : '🔐 Change Password'}
              </button>
            </form>
          </div>

          <!-- Account Info -->
          <div class="profile-section">
            <div class="section-header">
              <h2>Account Information</h2>
            </div>

            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Role</span>
                <span class="info-value">${this.currentUser?.role || 'N/A'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Member Since</span>
                <span class="info-value">${new Date(this.currentUser?.createdAt).toLocaleDateString()}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Account Status</span>
                <span class="info-value status-active">✓ Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}