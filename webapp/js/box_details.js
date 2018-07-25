

function getID (){
    var mysteryID = window.location.hash
    console.log(`${mysteryID.slice(1, mysteryID.length)}`)
    return mysteryID.slice(1, mysteryID.length)
}

function displayBoxItems(mysteryID){

    // web3 call all auctions function

    var mysteryName = "hiii";
    var mysteryDescription = "jlahdfa";
    var imageSrc= "images/Sample NFTs/King_BIG.png" //TODO needs to be random

    var $tablebody = $(`
            <tr class="spacer"></tr>
            <tr class="tr-shadow">
                <td>
                    <label class="au-checkbox">
                        <img src="${imageSrc}" style="width:100px;height:100px;" alt="King_BIG" />
                    </label>
                </td>
                <td>${mysteryName}</td>
                <td>
                    <span class="block-email">${mysteryID}</span>
                </td>
                <td class="desc">${mysteryDescription}</td>
            </tr>;
            `)
        $tablebody.on('click',_=>{bidAuction(mysteryID)});
        $('#auctionTable').find('tbody').append($tablebody);

    // orders.forEach((o, index)=>{
    //     var $tablebody = $(`
    //         <tr class="spacer"></tr>
    //         <tr class="tr-shadow">
    //             <td>
    //                 <label class="au-checkbox">
    //                     <input type="checkbox">
    //                     <span class="au-checkmark"></span>
    //                 </label>
    //             </td>
    //             <td>${mysteryName}</td>
    //             <td>
    //                 <span class="block-email">${mysteryID}</span>
    //             </td>
    //             <td class="desc">${mysteryDescription}</td>
    //             <td>${mysteryReveal}</td>
    //             <td>
    //                 <span class="status--process">${mysteryClose}</span>
    //             </td>
    //         </tr>;
    //         `)
    //     $tablebody.on('click',_=>{bidAuction(mysteryID)});
    //     $('#auctionTable').find('tbody').append($tablebody);

    // }
}

function bidAuction(mysteryID){
    console.log("here?")
    window.location.href = `box_details.html#${mysteryID}`    

}

var ID = getID();
displayBoxItems(ID);

