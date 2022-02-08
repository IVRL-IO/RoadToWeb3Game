<style>

</style>
<script>
    export let socket = {users: 1, usersTotal: 2, value: "1 ETH | $2,881.29"};
    export let wallet = {account: "", connected: false, gasPrice: 0, balance: 0};

    const web3authSdk = window.Web3auth
    let web3AuthInstance = null;
    //Set on successful login
    let web3A = null;

    web3AuthInstance = new web3authSdk.Web3Auth({
                                                    chainConfig: {chainNamespace: "eip155"},
                                                    clientId: "BNp9wPRk6KyzQT-hn3vZv-Epw-UA7IA0G_ufVIzDOahRkKcZgoIxEaincfYNSWO2Fn9ueJnIj5xJBkoVj3Nj5sM" // get your clientId from https://dashboard.web3auth.io
                                                });


    subscribeAuthEvents(web3AuthInstance)

    web3AuthInstance.initModal();

    async function initWeb3() {
        // we can access this provider on `web3AuthInstance` only after user is logged in.
        // This provider is also returned as a response of `connect` function in step 4. You can use either ways.
        const web3 = new Web3(web3AuthInstance.provider);
        debugger;
        wallet.account = (web3.eth.getAccounts())[0];
        wallet.balance = web3.eth.getBalance(wallet.account);
    }

    if (web3AuthInstance.provider) {
        const user = web3AuthInstance.getUserInfo();
        console.dir(user);
        initWeb3();
    } else {

    }

    function handleAccountsChanged(accounts) {
        if (accounts.length === 0) {
            // MetaMask is locked or the user has not connected any accounts
            console.log('Please connect to MetaMask.');
        } else if (accounts[0] !== wallet.account) {
            wallet.account = accounts[0];
            // Do any other work!
        }
    }

    function subscribeAuthEvents(web3auth) {
        web3auth.on("connected", (data) => {
            web3auth.on("connected", (data) => {
                const web3 = new Web3(web3auth.provider);
                web3.eth.getAccounts().then(function (accounts) {
                    wallet.connected = true;
                    wallet.account = accounts[0];
                    web3A = web3auth;
                });
            });
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
        if (wallet.account) {
            await web3A.logout().then(function () {
                wallet.account = null;
                wallet.connected = false;
            });

        } else {
            const provider = await web3AuthInstance.connect();
        }
    }

    async function logOut() {

        console.log("logged out");
    }

</script>
<nav class="navbar navbar-expand-lg justify-content-between">
    <!-- Image and text -->
    <nav class="navbar">
        <a class="navbar-brand text-danger" href="/">
            <img src="GoldPoo.png" style="max-height: 32px" alt="I Stole This and all I got was poo"/>
            I Stole This
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
                <span class="nav-link"><b>Connected Users:</b> {socket.usersTotal}</span>

            </li>
            <li class="nav-item">
                <span class="nav-link"><b>User in round:</b> {socket.users}</span>

            </li>
            <li class="nav-item">
                <span class="nav-link"><b>Estimated NFT Value:</b> {socket.value}</span>

            </li>
            <li class="nav-item">
                <span class="nav-link"><b>Gas Price:</b> {wallet.gasPrice}</span>

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