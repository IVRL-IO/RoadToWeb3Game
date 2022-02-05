<script>
    import Moralis from 'moralis/dist/moralis.min.js';
    /* Moralis init code */
    const serverUrl = "https://jqsksstyjvdt.usemoralis.com:2053/server";
    const appId = "IN1bckjO6Q9NjQLiqsigTCzbxaQlNj17xgs05vl5";
    Moralis.start({serverUrl, appId});

    export let socket = {users: 1, usersTotal: 2, value: "1 ETH | $2,881.29"};
    export let wallet = {connected: false, gasPrice: 0};
    let user = null;

    /* Authentication code */
    async function login() {

        user = Moralis.User.current();
        if (!user) {
            user = await Moralis.authenticate({signingMessage: "Log in using Moralis"})
                .then(function (user) {
                    console.log("logged in user:", user);
                    console.log(user.get("ethAddress"));
                    wallet.connected = true;
                })
                .catch(function (error) {
                    console.log(error);
                });
        } else {
            wallet.connected = true;
        }
    }

    async function logOut() {
        await Moralis.User.logOut();
        console.log("logged out");
    }

    user = Moralis.User.current();
    if (user) {
        wallet.connected = true;
    }

    async function getAverageGasPrices() {
        const results = await Moralis.Cloud.run("getAvgGas");
        console.log("average user gas prices:", results);
        wallet.gasPrice = results[0].avgGas;
    }

    function walletConnect() {
        console.log("Wallet connected");
        wallet = Moralis.authenticate({provider: "walletconnect"});
        getAverageGasPrices();
    }

</script>
<nav class="navbar navbar-expand-lg justify-content-between">
    <!-- Image and text -->
    <nav class="navbar">
        <a class="navbar-brand text-danger" href="/">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check-circle" viewBox="0 0 16 16">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z"/>
            </svg>
            IStoleThis
        </a>
    </nav>
    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
    </button>

    <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav mr-auto">
            <li class="nav-item">
                <a class="nav-link" href="#Docs">Documentation</a>
            </li>
            <li class="nav-item">
                <span class="nav-link">Connected Users: {socket.usersTotal}</span>

            </li>
            <li class="nav-item">
                <span class="nav-link">User in round: {socket.users}</span>

            </li>
            <li class="nav-item">
                <span class="nav-link">Estimated NFT Value: {socket.value}</span>

            </li>
            <li class="nav-item">
                <span class="nav-link">Gas Price: {wallet.gasPrice}</span>

            </li>
        </ul>
    </div>
    <span class="navbar-text">
        {#if wallet.connected}
            <a class="navbar-brand" href="#connect" on:click="{login}">{user ? user.get('ethAddress') : ""}</a>

        {:else }
            <a class="navbar-brand" href="#connect" on:click="{login}">Connect Wallet</a>
        {/if}
    </span>

</nav>