function Logout() {
  // Remove the token from local storage
  localStorage.removeItem("token");
  // Redirect to the login page
  window.location.href = "/login";
}  

export default Logout;

