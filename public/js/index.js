import '@babel/polyfill';
import { signup } from './signup';
import { login } from './login';
import { forgotPassword } from './login';
import { logout } from './login';
import { showLogin } from './login';
import { showSignup } from './signup';
import { showMenu } from './menu';

//Animation Functions
import { locoScroll } from './script';
import { cursorEffect } from './script';
import { sliderAnimaton } from './script';
import { loader } from './script';

locoScroll();
cursorEffect();
sliderAnimaton();
loader();

//DOM Elements
const signupForm = document.querySelector(`.form-signup`);
const loginForm = document.querySelector(`.form-login`);
const logoutBtn = document.querySelector(`.logout__btn`);
const logIn = document.getElementById('logIn');
const forgotPasswordBtn = document.getElementById('forgotPassword');
const signUp = document.getElementById('signUp');
const register = document.getElementById(`register`);
const container = document.querySelector('.login-page .container');
const signupContainer = document.querySelector(
  '.signup-page .signup-container'
);
const menu = document.getElementById('menu');

//SIGNUP
if (signUp) {
  showSignup(signUp, register, signupContainer);
}

if (signupForm) {
  signupForm.addEventListener(`submit`, (el) => {
    el.preventDefault();
    const name = document.getElementById(`name-signup`).value;
    const email = document.getElementById(`email-signup`).value;
    const password = document.getElementById(`password-signup`).value;
    const passwordConfirm = document.getElementById(
      `passwordConfirm-signup`
    ).value;
    signup(name, email, password, passwordConfirm);
  });
}

//LOGIN
if (logIn) {
  showLogin(logIn, container);
}

if (loginForm) {
  loginForm.addEventListener(`submit`, (el) => {
    el.preventDefault();
    const email = document.getElementById(`email-login`).value;
    const password = document.getElementById(`password-login`).value;
    login(email, password);
  });
}

//FORGOT PASSWORD
if (forgotPasswordBtn) {
  forgotPasswordBtn.addEventListener(`click`, () => {
    const email = document.getElementById(`email-login`).value;
    forgotPassword(email);
  });
}

//LOGOUT
if (logoutBtn) {
  logoutBtn.addEventListener(`click`, logout);
}

//MENU
if (menu) {
  showMenu(menu);
}
