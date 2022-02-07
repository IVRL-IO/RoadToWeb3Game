<svelte:head>
    <meta name="color-scheme" content="dark light">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-dark-5@1.1.3/dist/css/bootstrap-dark.min.css" rel="stylesheet" media="(prefers-color-scheme: dark)">
</svelte:head>

<script>
    import Navbar from "./componets/navbar.svelte"

    let wallet = {connected: false, showErrorMsg: false};
    let active = false;
    wallet.connected = typeof window.ethereum !== 'undefined';

    function buttonPress(event) {
        active = !active;
        event.target.src = 'buttonPushed.png';
        if (wallet.connected && wallet.showErrorMsg === false) {
            wallet.showErrorMsg = true;
        }
    }
    function buttonRelease(event) {
        active = !active;
        event.target.src = 'button.png';
        if (wallet.connected && wallet.showErrorMsg === false) {
            wallet.showErrorMsg = true;
        }
    }
</script>
<style>
    .active {
        background-image: url('/buttonPressed.png') !important;;
    }
</style>

<main>
    <Navbar/>

    <div class="container-fluid">

        <div class="row align-self-center" style="min-height: 148px; text-align: center">
            <div class="col col-md-2 offset-md-4" class:active="{active}"
                 on:mousedown="{buttonPress}"   on:touchstart="{buttonPress}">

                <img src="button.png" style=" background-repeat: no-repeat;min-height: 200px; max-height: 800px;"   on:mouseup="{buttonRelease}"
                     on:touchend="{buttonRelease}"/>
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