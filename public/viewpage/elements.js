export const root = document.getElementById('root');

export const modalInfoBox = {
    modal: new bootstrap.Modal(document.getElementById('modal-infobox'), {backdrop: 'static'}),
    title: document.getElementById('modal-infobox-title'),
    body: document.getElementById('modal-infobox-body'),
}

export const modalSignin = new bootstrap.Modal(document.getElementById('modal-signin-form'), {backdrop: 'static'});
export const formSignin = document.getElementById('form-signin');

export const modalpreauthElements = document.getElementsByClassName('modal-preauth');
export const modalpostauthElements = document.getElementsByClassName('modal-postauth');

export const menus = {
    signIn: document.getElementById('menu-signin'),
    tictactoe: document.getElementById('menu-tictactoe'),
    about: document.getElementById('menu-about'),
    signOut: document.getElementById('menu-signout'),
};