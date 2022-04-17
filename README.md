# Aadharsh Kannan Digital Coin

Aadharsh Kannan Digital Coin (AKDC) is a special ERC20 implementation that enables the utilization of an on-ramp, off-ramp intermediary. It allows the owners of AKDC to earmark funds to be spent and authorize the intermediary to complete the transaction when a pre-specified condition is met.

AKDC also implements to support special cross-chain use cases. It prevents sneaky revocations by broadcasting a revoke event. 
```js
function revoke(address spender, uint256 amount) external returns (bool)
function unspentEarmarked(address account) external view returns(uint256)
```