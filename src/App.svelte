<svelte:head>
    <meta name="color-scheme" content="dark light">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-dark-5@1.1.3/dist/css/bootstrap-dark.min.css" rel="stylesheet" media="(prefers-color-scheme: dark)">
</svelte:head>

<script>
    import Navbar from "./componets/navbar.svelte"

    let wallet = {connected: false, showErrorMsg: false};
    let active = false;
    wallet.connected = typeof window.ethereum !== 'undefined';

    function buttonPress() {
        active = !active;
        if (wallet.connected && wallet.showErrorMsg === false) {
            wallet.showErrorMsg = true;
        }
    }
</script>
<style>
    .active {
        color: red;
    }
</style>

<main>
    <Navbar/>

    <div class="container-fluid">

        <div class="row justify-content-center  align-self-center" style="min-height: 148px">
            <div class="col col-md-2 offset-md-1" class:active="{active}"
                 on:mousedown="{buttonPress}" on:mouseup="{buttonPress}"
                 on:touchstart="{buttonPress}" on:touchend="{buttonPress}">
                <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" fill="currentColor" class="bi bi-check-circle" viewBox="0 0 16 16">
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                    <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z"/>
                </svg>
            </div>
        </div>
        {#if wallet.showErrorMsg}
            <div class="row">
                <div class="col col-md-6 offset-md-3 ">
                    <div class="alert alert-warning" role="alert">
                        HEY! You need your wallet connected. Stealing NFTs is one thing, wanting a free ride tsk tsk.
                    </div>
                </div>
            </div>
        {/if}
        <div class="row  align-items-end align-self-end">
            <div class="col col-md-6 offset-md-3 ">
                <div class="alert alert-warning" role="alert">
                    Didn't you know stealing was bad? Don't click/press/right-click the button.
                </div>
            </div>
        </div>
        <div class="row align-items-end align-self-end">
            <div class="col  col-md-6 offset-md-3">
                <div class="alert alert-info" role="alert">
                    <div>What is this? A game where you try to steal the winning nft. When you press the button or right
                        click it
                        your wallet will open to enter the round.
                        <div>
                            Everyone will get an NFT for round. You can opt of minting on loss. Only 1 person will get
                            the treasure and it's the 2nd to last in
                            the round.
                            <div>Why second to last? You very naughty and used a DMCA notice to steal from the original
                                artist even!
                            </div>
                            <div>Choose your gas wisely as you can delay a transaction buy setting low gas or execute
                                instantly with
                                high gas.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap-dark-5@1.1.3/dist/js/darkmode.js"></script>
</main>