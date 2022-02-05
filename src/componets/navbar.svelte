<style>

</style>
<script>
    export let socket = {users: 1, usersTotal: 2, value: "1 ETH | $2,881.29"};
    export let wallet = {account: "", connected: false, gasPrice: 0, balance: 0};

    const web3authSdk = window.Web3auth
    let web3AuthInstance = null;


        web3AuthInstance = new web3authSdk.Web3Auth({
            chainConfig: { chainNamespace: "eip155"},
            clientId: "BNp9wPRk6KyzQT-hn3vZv-Epw-UA7IA0G_ufVIzDOahRkKcZgoIxEaincfYNSWO2Fn9ueJnIj5xJBkoVj3Nj5sM" // get your clientId from https://dashboard.web3auth.io
        });


        subscribeAuthEvents(web3AuthInstance)

         web3AuthInstance.initModal();
    async function initWeb3() {
        // we can access this provider on `web3AuthInstance` only after user is logged in.
        // This provider is also returned as a response of `connect` function in step 4. You can use either ways.
        const web3 = new Web3(web3AuthInstance.provider);
        wallet.account = (web3.eth.getAccounts())[0];
        wallet.balance=  web3.eth.getBalance(wallet.account);
    }
        if (web3AuthInstance.provider) {
            const user =  web3AuthInstance.getUserInfo();
             initWeb3();
        } else {

        }

    function subscribeAuthEvents(web3auth) {
        web3auth.on("connected", (data) => {
            console.log("Yeah!, you are successfully logged in", data);

        });

        web3auth.on("connecting", () => {
            console.log("connecting");
        });

        web3auth.on("disconnected", () => {
            console.log("disconnected");
        });

        web3auth.on("errored", (error) => {
            console.log("some error or user have cancelled login request", error);
        });

        web3auth.on("MODAL_VISIBILITY", (isVisible) => {
            console.log("modal visibility", isVisible)
        });
    }

    async function connectEther(privKey) {

    }

    /* Authentication code */
    async function login() {
        const provider = await web3AuthInstance.connect();
    }

    async function logOut() {

        console.log("logged out");
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
            <a class="navbar-brand" href="#connect" on:click="{login}">{wallet.account ? wallet.account : ""}</a>

        {:else }
            <a class="navbar-brand" href="#connect" on:click="{login}">Connect Wallet</a>
        {/if}
    </span>

</nav>