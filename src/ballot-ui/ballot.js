
import { getEthProvider } from 'rchain-api';
import { signIn } from '../participate';

document.addEventListener("DOMContentLoaded", function() {
    const signin = document.getElementById("signIn");

    signin.addEventListener('click', () => {
        signIn({ html, getEthProvider });
    })
})