pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract ERC1155 {
    using SafeMath for uint256;

    // Variables
    struct Items {
        string name;
        uint256 totalSupply;
        mapping (address => uint256) balances;
    }
    mapping (uint256 => uint8) public decimals;
    mapping (uint256 => string) public symbols;
    mapping (uint256 => mapping(address => mapping(address => uint256))) allowances;
    mapping (uint256 => Items) public items;
    mapping (uint256 => string) metadataURIs;

    // Events
    event Approval(address indexed _owner, address indexed _spender, uint256 indexed _itemId, uint256 _oldValue, uint256 _value);
    event Transfer(address _spender, address indexed _from, address indexed _to, uint256 indexed _itemId, uint256 _value);

    // TEMP CONSTRUCTOR - Testing purposes
    /**
    constructor() public {
        items[1].balances[msg.sender] = 1000;
        items[2].balances[msg.sender] = 1000;
        items[3].balances[msg.sender] = 1000;
    }
    */

    function transfer(address _to, uint256[] _itemIds, uint256[] _values) external {
        uint256 _itemId;
        uint256 _value;

        for (uint256 i = 0; i < _itemIds.length; ++i) {
            _itemId = _itemIds[i];
            _value = _values[i];

            items[_itemId].balances[msg.sender] = items[_itemId].balances[msg.sender].sub(_value);
            items[_itemId].balances[_to] = _value.add(items[_itemId].balances[_to]);

            emit Transfer(msg.sender, msg.sender, _to, _itemId, _value);
        }
    }

    function transferFrom(address _from, address _to, uint256[] _itemIds, uint256[] _values) external {
        uint256 _itemId;
        uint256 _value;

        if(_from == msg.sender || isApprovedForAll(_from, msg.sender)) {
            for (uint256 i = 0; i < _itemIds.length; ++i) {
                _itemId = _itemIds[i];
                _value = _values[i];

                items[_itemId].balances[_from] = items[_itemId].balances[_from].sub(_value);
                items[_itemId].balances[_to] = _value.add(items[_itemId].balances[_to]);

                emit Transfer(msg.sender, _from, _to, _itemId, _value);
            }
        }
        else {
            for (i = 0; i < _itemIds.length; ++i) {
                _itemId = _itemIds[i];
                _value = _values[i];

                allowances[_itemId][_from][msg.sender] = allowances[_itemId][_from][msg.sender].sub(_value);

                items[_itemId].balances[_from] = items[_itemId].balances[_from].sub(_value);
                items[_itemId].balances[_to] = _value.add(items[_itemId].balances[_to]);

                emit Transfer(msg.sender, _from, _to, _itemId, _value);
            }
        }
    }

    function approve(address _spender, uint256[] _itemIds,  uint256[] _currentValues, uint256[] _values) external {
        uint256 _itemId;
        uint256 _value;

        for (uint256 i = 0; i < _itemIds.length; ++i) {
            _itemId = _itemIds[i];
            _value = _values[i];

            require(_value == 0 || allowances[_itemId][msg.sender][_spender] == _currentValues[i]);
            allowances[_itemId][msg.sender][_spender] = _value;
            emit Approval(msg.sender, _spender, _itemId, _currentValues[i], _value);
        }
    }

    // Optional Single Item Functions
    function transferSingle(address _to, uint256 _itemId, uint256 _value) external {
        // Not needed. SafeMath will do the same check on .sub(_value)
        //require(_value <= items[_itemId].balances[msg.sender]);
        items[_itemId].balances[msg.sender] = items[_itemId].balances[msg.sender].sub(_value);
        items[_itemId].balances[_to] = _value.add(items[_itemId].balances[_to]);
        emit Transfer(msg.sender, msg.sender, _to, _itemId, _value);
    }

    function transferFromSingle(address _from, address _to, uint256 _itemId, uint256 _value) external {
        if(_from != msg.sender) {
            if(!isApprovedForAll(_from, msg.sender)){
                require(allowances[_itemId][_from][msg.sender] >= _value);
                allowances[_itemId][_from][msg.sender] = allowances[_itemId][_from][msg.sender].sub(_value);
            }   
        }

        items[_itemId].balances[_from] = items[_itemId].balances[_from].sub(_value);
        items[_itemId].balances[_to] = _value.add(items[_itemId].balances[_to]);

        emit Transfer(msg.sender, _from, _to, _itemId, _value);
    }

    function approveSingle(address _spender, uint256 _itemId, uint256 _currentValue, uint256 _value) external {
        // if the allowance isn't 0, it can only be updated to 0 to prevent an allowance change immediately after withdrawal
        require(_value == 0 || allowances[_itemId][msg.sender][_spender] == _currentValue);
        allowances[_itemId][msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _itemId, _currentValue, _value);
    }

    // Optional Multicast Functions
    function transferMulticast(address[] _to, uint256[] _itemIds, uint256[] _values) external {
        for (uint256 i = 0; i < _to.length; ++i) {
            uint256 _itemId = _itemIds[i];
            uint256 _value = _values[i];
            address _dst = _to[i];

            items[_itemId].balances[msg.sender] = items[_itemId].balances[msg.sender].sub(_value);
            items[_itemId].balances[_dst] = _value.add(items[_itemId].balances[_dst]);

            emit Transfer(msg.sender, msg.sender, _dst, _itemId, _value);
        }
    }

    function transferFromMulticast(address[] _from, address[] _to, uint256[] _itemIds, uint256[] _values) external {
        for (uint256 i = 0; i < _from.length; ++i) {
            uint256 _itemId = _itemIds[i];
            uint256 _value = _values[i];
            address _src = _from[i];
            address _dst = _to[i];

            if (_from[i] != msg.sender)
                allowances[_itemId][_src][msg.sender] = allowances[_itemId][_src][msg.sender].sub(_value);

            items[_itemId].balances[_src] = items[_itemId].balances[_src].sub(_value);
            items[_itemId].balances[_dst] = _value.add(items[_itemId].balances[_dst]);

            emit Transfer(msg.sender, _src, _dst, _itemId, _value);
        }
    }

    function approveMulticast(address[] _spenders, uint256[] _itemIds,  uint256[] _currentValues, uint256[] _values) external {
        address _spender;
        uint256 _itemId;
        uint256 _value;

        for (uint256 i = 0; i < _itemIds.length; ++i) {
            _spender = _spenders[i];
            _itemId = _itemIds[i];
            _value = _values[i];

            require(_value == 0 || allowances[_itemId][msg.sender][_spender] == _currentValues[i]);
            allowances[_itemId][msg.sender][_spender] = _value;
            emit Approval(msg.sender, _spender, _itemId, _currentValues[i], _value);
        }
    }

    // Required View Functions
    function balanceOf(uint256 _itemId, address _owner) external view returns (uint256) {
        return items[_itemId].balances[_owner];
    }

    function allowance(uint256 _itemId, address _owner, address _spender) external view returns (uint256) {
        return allowances[_itemId][_owner][_spender];
    }

    // Optional meta data view Functions
    // consider multi-lingual support for name?
    function name(uint256 _itemId) external view returns (string) {
        return items[_itemId].name;
    }

    function symbol(uint256 _itemId) external view returns (string) {
        return symbols[_itemId];
    }

    function decimals(uint256 _itemId) external view returns (uint8) {
        return decimals[_itemId];
    }

    function totalSupply(uint256 _itemId) external view returns (uint256) {
        return items[_itemId].totalSupply;
    }

    function itemURI(uint256 _itemId) external view returns (string) {
        return metadataURIs[_itemId];
    }

    // Mapping from owner to operator approvals
    mapping (address => mapping (address => bool)) internal operatorApprovals;
	    
    event ApprovalForAll(
        address indexed _owner,
        address indexed _operator,
        bool _approved
    );
	
    /**
    * @dev Sets or unsets the approval of a given operator
    * An operator is allowed to transfer all tokens of the sender on their behalf
    * @param _to operator address to set the approval
    * @param _approved representing the status of the approval to be set
    */
    function setApprovalForAll(address _to, bool _approved) public {
        require(_to != msg.sender);
        operatorApprovals[msg.sender][_to] = _approved;
        emit ApprovalForAll(msg.sender, _to, _approved);
    }

    /**
    * @dev Tells whether an operator is approved by a given owner
    * @param _owner owner address which you want to query the approval of
    * @param _operator operator address which you want to query the approval of
    * @return bool whether the given operator is approved by the given owner
    */
    function isApprovedForAll(
        address _owner,
        address _operator
    )
        public
        view
        returns (bool)
    {
        return operatorApprovals[_owner][_operator];
    }
}
