//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;
import "hardhat/console.sol";

contract SpendMath{
    function add(uint256 balance, uint256 tokens) public pure returns (uint256)
    {
        require(tokens>0,"Only positive additions allowed");
        uint256 result = balance + tokens;

        return result;
    }

    function subtract(uint256 balance, uint256 tokens) public pure returns (uint256)
    {
        require(balance>=tokens,"Insufficient balance to spend");
        uint256 result = balance - tokens;

        return result;
    }
}
 
interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function allowance(address consenter, address spender) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed consenter, address indexed spender, uint256 value);
}

interface IERC20Ext{
    function revoke(address spender, uint256 amount) external returns (bool);
    function unspentEarmarked(address account) external view returns(uint256);

    event Revocation(address indexed consenter, address indexed spender, uint256 value);
}

contract AKDigitalCoin is IERC20,IERC20Ext{
    string public symbol = "AKDC";
    string public  name = "Aadharsh Kannan Digital Coin";
    uint8 public decimals = 2;
    address public owner;
    uint256 public _totalSupply;
    
    SpendMath private safeOp = new SpendMath();
    uint256 private _totalTokenSupply = 250000;
 
    mapping(address => uint256) balances;
    mapping(address => mapping(address => uint256)) allowances;
    mapping(address => uint256) earmarks;

    constructor(){
        owner = msg.sender;
        _totalSupply =  _totalTokenSupply*10^decimals;

        console.log("Deploying AKDC with address:",owner);
        balances[owner] = _totalSupply;
    }

    function totalSupply() external view override returns (uint256){
        // gives how many tokens are allocated out there
        return _totalSupply-balances[owner];
    }

    function balanceOf(address account) external view override returns (uint256){
        return balances[account];
    }

    function unspentEarmarked(address account) external view override returns(uint256){
        return earmarks[account];
    }

    function transfer(address recipient, uint256 amount) external override returns (bool){
        address spender = msg.sender;
        
        require((balances[spender]-earmarks[spender])>=amount,"Insufficient net funds after earmarks to spend.");
        
        balances[spender] = safeOp.subtract(balances[spender],amount);
        balances[recipient] = safeOp.add(balances[recipient],amount);

        emit Transfer(spender,recipient,amount);

        return true;
    }
    
    function approve(address spender, uint256 amount) external override returns (bool){
        address consenter = msg.sender;
        // You cannot earmark AKDC via allowance and spend it again
        require((balances[consenter]-earmarks[consenter])>=amount,"Insufficient net funds after earmarks to allow.");

        allowances[consenter][spender] = safeOp.add(allowances[consenter][spender],amount);
        earmarks[consenter] = safeOp.add(earmarks[consenter],amount);

        emit Approval(consenter,spender,amount);

        return true;        
    }

    function revoke(address spender, uint256 amount) external override returns (bool){
        address consenter = msg.sender;
        
        // Revoking funds
        require(allowances[consenter][spender]>=amount,"You can only revoke what you allowed.");

        allowances[consenter][spender] = safeOp.subtract(allowances[consenter][spender],amount);
        earmarks[consenter] = safeOp.subtract(earmarks[consenter],amount);

        emit Revocation(consenter,spender,amount);

        return true;        
    }

    function allowance(address consenter, address spender) external view override returns (uint256){
        return allowances[consenter][spender];
    }
    
    function transferFrom(address sender, address recipient, uint256 amount) external override returns (bool){
        address spender = msg.sender;

        require(allowances[sender][spender]>=amount,"Insufficient allowance");
        
        allowances[sender][spender] = safeOp.subtract(allowances[sender][spender],amount);
        earmarks[sender] = safeOp.subtract(earmarks[sender],amount);

        balances[sender] = safeOp.subtract(balances[sender],amount);
        balances[recipient] = safeOp.add(balances[recipient],amount);

        emit Transfer(sender,recipient,amount);

        return true;
    }
}
