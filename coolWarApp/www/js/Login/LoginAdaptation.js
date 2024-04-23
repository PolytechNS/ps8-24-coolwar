export const loginAdaptation = () => {
    console.log('CLIENT WINDOW CHANGING SIZE !');
    if(document.documentElement.clientWidth > 600){
        const usernameLABEL = document.getElementsByTagName('label')[0];
        const passwordLABEL = document.getElementsByTagName('label')[1];
        const usernameINPUT = document.getElementsByTagName('input')[0];
        const passwordINPUT = document.getElementsByTagName('input')[1];

        usernameLABEL.innerHTML = 'Username';
        passwordLABEL.innerHTML = 'Password';

        usernameINPUT.placeholder = '';
        passwordINPUT.placeholder = '';
    }
    else{
        const usernameLABEL = document.getElementsByTagName('label')[0];
        const passwordLABEL = document.getElementsByTagName('label')[1];
        const usernameINPUT = document.getElementsByTagName('input')[0];
        const passwordINPUT = document.getElementsByTagName('input')[1];

        usernameLABEL.innerHTML = '';
        passwordLABEL.innerHTML = '';

        usernameINPUT.placeholder = 'Username';
        passwordINPUT.placeholder = 'Password';
    }
}