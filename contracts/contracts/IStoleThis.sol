// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";
import { IterableMapping.Map, IterableMapping.creator } from "./libs/IterableMapping.sol";

contract IStoleThis is Initializable, PausableUpgradeable, AccessControlUpgradeable, UUPSUpgradeable  {
    using Address for address payable;
    using IterableMapping for IterableMapping.Map;

    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    CountersUpgradeable.Counter private _tokenIdCounter;
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    // can start or end a round
    bytes32 public constant ROUND_ADMIN_ROLE = keccak256("ROUND_ADMIN_ROLE");
    // Can withdraw link from contract
    bytes32 public constant LINK_ADMIN_ROLE = keccak256("LINK_ADMIN_ROLE");
    // @dev Chainlink keyhash
    bytes32 internal keyHash;

    /**
    * Based off block time of 1 block ever 2.25 seconds
    * 24 blocks a min
    * 1440 blocks an hour
    * This time is updated every round based on last player count.
    * min round time is 10 mins or 240 blocks
    **/
    uint private _duration = 1440;

    // how long the contract will purchase an NFT
    // if user does not accept offer in ~ 24 hours amount is transfer to creators.
    // this prevents currency being stuck in the contract in case the user never claims or
    // the user sales the NFT on a market place.
    uint private _saleOfferTime = 34560;

    // Creator fee is capped at 10% max. Fee can be adjusted lower or back to
    // max. Fee covers maintenance and AWS costs. AWS is not needed but used
    // to share stats to all users for the round.
    uint private _creatorFee = .1;

    // current round id
    uint256 private _round_index = 0;

    // @dev chainlink fee set by constructor
    uint256 internal fee;

    // @dev chainlink VRF result
    uint256 public randomResult;

    // @dev cost to mint an NFT this is removed from the entrance fee
    uint256 public nftMintAndGasCost;

    // Any underpay in theory should never happen...
    address underPaymentAddress = 0x3793D61a6db2Da1fCEe93616A558332A2fC05A4A;

    /// At the end of the round funds are transferred to allow address sell the NFT based
    /// on perceived value
    mapping(address => uint256) private _nftSaleValue;

    // List of creator addresses - Used to allow withdrawal or royalties / maintenance fees.
    IterableMapping.Map private _creators;

    event roundTimeChange(uint blocks, uint256 round);
    event joinRound(address indexed payee, uint256 weiAmount, uint256 rightClickTS);
    event roundEnd(round lastRound, address winner);
    event roundStart();

    mapping(address => round) private _rounds;
    mapping(address => unit256) private _deposits;

    /**
    * Players are not restricted from entering more than once per round
    **/
    struct round {
        mapping(address => roundEntrance) players;
        uint256 winningSlot;
        uint256 totalPlayers;
        uint256 roundValue;
        uint256 roundEndBlock;
        uint256 vrfSeed;
    }

    struct roundEntrance {
        uint256 blockNumber;
        uint256 blockTime;
        unint256 time;
    }

    /**
     * Constructor inherits VRFConsumerBase
     *
     * Network: Kovan
     * Chainlink VRF Coordinator address: 0xdD3782915140c8f3b190B5D67eAc6dc5760C46E9
     * LINK token address:                0xa36085F69e2889c224210F603D836748e7dC0088
     * Key Hash:                          0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4
     * fee	                              0.1 LINK
     *
     * Network: Mumbai Testnet
     * Chainlink VRF Coordinator address: 0x8C7382F9D8f56b33781fE506E897a4F1e2d17255
     * LINK token address:                0x326C977E6efc84E512bB9C30f76E30c160eD06FB
     * Key Hash:                          0x6e75b569a01ef56d18cab6a8e71e6600d6ce853834d4a5748b720d06f878b3a4
     * fee                                0.0001 LINK
     *
     * Polygon Mainnet
     * Chainlink VRF Coordinator address: 0x3d2341ADb2D31f1c5530cDC622016af293177AE0
     * LINK token address:                0xb0897686c545045aFc77CF20eC7A532E3120E0F1
     * Key Hash:                          0xf86195cf7690c55907b2b611ebb7343a6f649bff128701cc542f0569e2c549da
     * Fee	0.0001 LINK
     *
     * Requires deployment to pass in correct address for chainlink
     */
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor(address vrfCoordinator, address linkToken, address keyHash, unit fee)
    VRFConsumerBase(
        vrfCoordinator, // VRF Coordinator
        linkToken  // LINK Token
    ) initializer
    {
        keyHash = keyHash;
        fee = fee * 10 ** 18;
    }

    function initialize() initializer public {
        __Pausable_init();
        __AccessControl_init();
        __UUPSUpgradeable_init();
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(UPGRADER_ROLE, msg.sender);
        _grantRole(ROUND_ADMIN_ROLE, msg.sender);
        _grantRole(LINK_ADMIN_ROLE, msg.sender);
        initCreators();
    }

    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function initCreators() private
    {
        // Team creator / Idea person / Lead Developer Robert M. Meffe - IVRL Inc Wallet
        // Gets to pay AWS cost
        _creators.set(address(0), IterableMapping.creator({
            creatorAddress: 0x3793D61a6db2Da1fCEe93616A558332A2fC05A4A,
            percentage: 4
        }));

        // Social Media Expert / Project Manager | Jeanine (Szeles) Osborne
        _creators.set(address(1), IterableMapping.creator({
            creatorAddress: 0x0d87cEe4EBd0b92f4ecc0A9b1F13940453FFB0aa,
            percentage: 2
        }));

        // Developer | Priyank Gupta
        _creators.set(address(2), IterableMapping.creator({
            creatorAddress: 0x0d87cEe4EBd0b92f4ecc0A9b1F13940453FFB0aa,
            percentage: 2
        }));

        // Artist |
        _creators.set(address(3), IterableMapping.creator({
            creatorAddress: 0x0d87cEe4EBd0b92f4ecc0A9b1F13940453FFB0aa,
            percentage: 2
        }));
    }

    /**
    * updates round time based
    **/
    function _update_round_time(uint blocks ) internal
    whenNotPaused
    {
        // use memory to save fees
        uint _newDuration = blocks;

        // bounds check lower block time, min 10 minutes
        _newDuration = blocks < 240 ? 240 : blocks;

        // bounds check upper limit, max 1 hour
        _newDuration = blocks > 1440 ? 1440 : blocks;
        _duration = _newDuration;
        emit roundTimeChange(blocks, _round_index);
    }

    /**
    * @dev Returns total able sale-able amount
    **/
    function roundInformation(address round) public view returns (round) {
        return _rounds[round];
    }

    /**
    * @dev Starts a new round
    **/
    function startRound() public
    OnlyRole(ROUND_ADMIN_ROLE)  {
        // can only start a new round once the block is past the endBlock of the current round
        if(_rounds[_round_index].roundEndBlock >= block.number){
            getRandomNumber();
        }
    }

    /**
    * @dev split the creator fees
    **/
    function splitCreators(uint256 weiAmount) {
        uint256 amountPaid = 0;
        for (uint i = 0; i < _creators.size(); i++) {
            address key = map.getKeyAtIndex(i);

            if(amountPaid <= weiAmount)
            {
                address creatorAddress = _creators[key].creatorAddress;
                uint percentage  = _creators[key].percentage;
                _deposits[creatorAddress] += weiAmount * percentage;
                // running total to make sure all wei is distributed
                amountPaid += weiAmount * percentage;
            }
        }
        if( amountPaid != weiAmount)
        {
            // sends to the team creator
            _deposits[underPaymentAddress] += weiAmount - amountPaid;
        }
    }

    /**
     * @dev Stores the sent amount as credit to be withdrawn.
     * @param payee The destination address of the funds.
     */
    function joinRound(address player) public payable
    whenNotPaused
    nonReentrant()
    {
        uint256 amount = msg.value;

        _rounds[_round_index].players[player] = roundEntrance({
            blockNumber: block.number,
            blockTime: block.timestamp,
            time: now()
        });
        // solidity .8+ compiler has overflow checking SafeMath omitted
        _rounds[_round_index].roundValue = amount - (amount * _creatorFee);

        _rounds[_round_index].totalPlayers += 1;
        // send the creatorFee to the creators
        _splitCreators(amount * _creatorFee);
        emit joinRound(payee, amount, now);
    }

    /**
     * @dev Withdraw accumulated balance for a payee, forwarding all gas to the
     * recipient.
     *
     * ReentrancyGuard used to prevent calling multiple times and draining contract
     *
     * @param payee The address whose funds will be withdrawn and transferred to.
     */
    function withdraw(address payable payee) public nonReentrant() {
        uint256 payment = _deposits[payee];

        _deposits[payee] = 0;

        payee.sendValue(payment);

        emit Withdrawn(payee, payment);
    }


    /**
    * Requests randomness
    * TODO: Call uniswap to get more link automatically using creators fees.
    */
    function getRandomNumber() internal returns (bytes32 requestId) {
        require(LINK.balanceOf(address(this)) >= fee, "Not enough LINK - fill contract with faucet");
        return requestRandomness(keyHash, fee);
    }

    /**
     * Callback function used by VRF Coordinator
     * chainlink recommends you pause the game while waiting for randomness to comeback
     * however we just delay the round start until it comes back.
     */
    function fulfillRandomness(bytes32 requestId, uint256 randomness) internal override {

        if(_rounds[_round_index].totalPlayers >= 1440 || ((1440 -_rounds[_round_index].totalPlayers) < 240)) {
            // fastest round time is 10 mins
            _update_round_time(240);
        } else if (_rounds[_round_index].totalPlayers >= 10) {
            // longest round time is 1 hour
            _update_round_time(1440);
        } else if (_rounds[_round_index].totalPlayers >= 10) {
            // select round time
            _update_round_time(1440 -_rounds[_round_index].totalPlayers);
        }
        // end the round before starting a new one
        emit roundEnd(_rounds[_round_index]);
        uint256 totalPlayers = _rounds[_round_index].totalPlayers;
        _round_index += 1;
        // round start we set the VRF result
        _rounds[_round_index].vrfSeed = randomness;

        // transform the result to winningSlot
        // select 10% of the last round player size
        // add two to make sure it's not the last slot ever
        uint256 winningSlot = (randomness % (totalPlayers * .1)) + 2;

        // winning slot is based on the totalPlayers - winningSlot
        // if winningSlot is larger than the total players in the round the slot will always be 2
        // this is displayed on the site as Current Winning slot:
        _rounds[_round_index].winningSlot = winningSlot;

    }

    /**
    * Withdraw LINK from this contract
    */
    function withdrawLink() external onlyRole(LINK_ADMIN_ROLE) {
        require(LINK.transfer(msg.sender, LINK.balanceOf(address(this))), "Unable to transfer");
    }
}

