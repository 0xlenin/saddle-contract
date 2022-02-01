// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "./PermissionlessSwap.sol";
import "../meta/MetaSwapUtils.sol";
import "../meta/MetaSwap.sol";

/**
 * @title MetaSwap - A StableSwap implementation in solidity.
 * @notice This contract is responsible for custody of closely pegged assets (eg. group of stablecoins)
 * and automatic market making system. Users become an LP (Liquidity Provider) by depositing their tokens
 * in desired ratios for an exchange of the pool token that represents their share of the pool.
 * Users can burn pool tokens and withdraw their share of token(s).
 *
 * Each time a swap between the pooled tokens happens, a set fee incurs which effectively gets
 * distributed to the LPs.
 *
 * In case of emergencies, admin can pause additional deposits, swaps, or single-asset withdraws - which
 * stops the ratio of the tokens in the pool from changing.
 * Users can always withdraw their tokens via multi-asset withdraws.
 *
 * MetaSwap is a modified version of Swap that allows Swap's LP token to be utilized in pooling with other tokens.
 * As an example, if there is a Swap pool consisting of [DAI, USDC, USDT], then a MetaSwap pool can be created
 * with [sUSD, BaseSwapLPToken] to allow trades between either the LP token or the underlying tokens and sUSD.
 * Note that when interacting with MetaSwap, users cannot deposit or withdraw via underlying tokens. In that case,
 * `MetaSwapDeposit.sol` can be additionally deployed to allow interacting with unwrapped representations of the tokens.
 *
 * @dev Most of the logic is stored as a library `MetaSwapUtils` for the sake of reducing contract's
 * deployment size.
 */
contract PermissionlessMetaSwap is MetaSwap {
    using PermissionlessSwapUtils for SwapUtils.Swap;

    IMasterRegistry public immutable MASTER_REGISTRY;
    bytes32 public constant FEE_COLLECTOR_NAME =
        0x466565436f6c6c6563746f720000000000000000000000000000000000000000;
    address public feeCollector;

    /**
     * @notice Constructor for the PermissionlessSwap contract.
     * @param _masterRegistry address of the MasterRegistry contract
     */
    constructor(IMasterRegistry _masterRegistry) public {
        MASTER_REGISTRY = _masterRegistry;
        _updateFeeCollectorCache(_masterRegistry);
    }

    /**
     * @notice Updates cached address of the fee collector
     */
    function updateFeeCollectorCache() public virtual {
        _updateFeeCollectorCache(MASTER_REGISTRY);
    }

    function _updateFeeCollectorCache(IMasterRegistry masterRegistry)
        internal
        virtual
    {
        feeCollector = masterRegistry.resolveNameToLatestAddress(
            FEE_COLLECTOR_NAME
        );
    }

    /*** ADMIN FUNCTIONS ***/

    /**
     * @notice Withdraw all admin fees to the contract owner and the fee collector
     */
    function withdrawAdminFees() external virtual override {
        require(
            msg.sender == owner() || msg.sender == feeCollector,
            "Caller is not authroized"
        );
        PermissionlessSwapUtils.withdrawAdminFees(
            swapStorage,
            owner(),
            feeCollector
        );
    }
}
