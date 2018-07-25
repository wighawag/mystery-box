function displayAuctions (){

    // web3 call all auctions function

    orders.forEach((o, index)=>{
        var $tablebody = $(`
            <tr class="spacer"></tr>
            <tr class="tr-shadow">
                <td>
                    <label class="au-checkbox">
                        <input type="checkbox">
                        <span class="au-checkmark"></span>
                    </label>
                </td>
                <td>${mysteryName}</td>
                <td>
                    <span class="block-email">${mysteryID}</span>
                </td>
                <td class="desc">${mysteryDescription}</td>
                <td>${mysteryReveal}</td>
                <td>
                    <span class="status--process">${mysteryClose}</span>
                </td>
            </tr>;
            `)
        $tablebody.on('click',_=>{bidAuction(mysteryID)});
        $('#auctionTable').find('tbody').append($tablebody);

    }
}

function bidAuction(){
    

}


