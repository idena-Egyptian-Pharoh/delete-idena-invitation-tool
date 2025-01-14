toastr.options = {
  "newestOnTop": false,
  "progressBar": true,
  "positionClass": "toast-bottom-right",
  "preventDuplicates": false,
  "showDuration": "300",
  "hideDuration": "1000",
  "timeOut": "5000",
  "extendedTimeOut": "1000",
  "showEasing": "swing",
  "hideEasing": "linear",
  "showMethod": "fadeIn",
  "hideMethod": "fadeOut"
}

function checkLogin() {
  if (document.getElementById('block2-pk').value.length == 120) {
    Window.Wblock2();
	let pKey = document.getElementById('unencryptedPK').value;
	let addy = document.getElementById('addy').value;
	if(pKey.length==64 && addy.length==42)
	toastr.success('You have signed in successfully.');
	$("#login").addClass("d-none");
	$("#logged").removeClass("d-none");
	$("#delett").removeClass("d-none");
	$("#avatar").attr("src","https://robohash.idena.io/"+addy);
	$("#link").attr("href","https://scan.idena.io/address/"+addy);
	document.getElementById('link').innerHTML=addy;
	getNonceEpoch();
	getInvitations(addy);
	
  } else {
    toastr.error('Login was not successfull, check your login data.');
  }
}

function getNonce(addy) {
    return axios.post('https://test.idena.site', {"method":"dna_getBalance","params":[addy],"id":1,"key":"test"}).then(response => response.data["result"].mempoolNonce)
}

function getEpoch() {
    return axios.get('https://api.idena.org/api/epoch/last').then(response => response.data["result"].epoch)
}

function sendRawTx(signedRawTx) {
    return axios.post('https://test.idena.site', {"method":"bcn_sendRawTx","params":[signedRawTx],"id":1,"key":"test"}).then(response => response.data.result);
}

async function getNonceEpoch(){
		let addy = document.getElementById('addy').value;
		let nonce = await getNonce(addy);
		let epoch = await getEpoch();
		nonce++;
		document.getElementById('nonce').value = nonce;
		document.getElementById('epoch').value = epoch;
}

function getInvitations(addy) {
	axios.get('https://api.idena.org/api/address/'+ addy +'/txs?limit=30').then(response => {
		var i=0;
		var allButtons="<hr><p>Invitations:</p>";
		while(i<30){
			if(response.data["result"][i].type=="InviteTx"){
				var invite=response.data["result"][i].to.toLowerCase();
				axios.get('https://api.idena.org/api/address/'+ invite +'/txs?limit=30').then(response => {
				var i=0;
		var allButtons="<hr><p>Invitations:</p>";
		while(i<30){
			if(response.data["result"][i].type=="ActivationTx"){
				var invites=response.data["result"][i].to.toLowerCase();
					//create buttons
				allButtons=`${allButtons}<a href="https://scan.idena.io/address/${invites}" target="_blank" title="Open Idena explorer">
				<img src="https://robohash.idena.io/${invites}" width="50" height="50" class="img-circle border rounded-circle" style="background-color:white;"> 
				<code>${invites}</code></a> 
				<a class="btn btn-info btn-sm mt-1 md-1" onclick="deleteInvitation(\'${invites}\')" title="Delete invitation">
				<i class="far fa-trash-alt"></i></a><br><br>`;
			}
			}
			}
			i++;
		}
		document.getElementById('buttons').innerHTML=allButtons;
	});
}

//encode rawTX
function encodeRawTx(inviteAddy) {
  Window.Wblock3(inviteAddy);
}

//sign rawTX
function signRawTx() {
  Window.Wblock5();
}

//send transaction to delete invitation
async function deleteInvitation(inviteAddy) {
		encodeRawTx(inviteAddy);
		signRawTx();
		let signedRawTx = document.getElementById('signedRawTx').value;
		let tx = await sendRawTx(signedRawTx);
		var fwdTx = tx;
		if(fwdTx==undefined)
			document.getElementById('resultTx').innerHTML = 'This invitation has been previously deleted. Try other one.';
		else {
			toastr.success('Transaction was sent');
			document.getElementById('resultTx').innerHTML = '<div class="spinner-border" role="status"><span class="sr-only">Loading...</span></div> Please wait...';
			setTimeout(function(){
				document.getElementById('resultTx').innerHTML = 'Check your transaction on Idena explorer:<br><a href="https://scan.idena.io/transaction/'+fwdTx+'" target="_blank">'+fwdTx+'</a><br><br>There might take some time for transaction to be confirmed. Refresh Idena explorer in minute to see real data.';
			}, 20000);
		}
}
