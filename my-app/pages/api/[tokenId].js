// Next.js API route support: https://nextjs.org/docs/api-routes/introduction


//base uri + token id 
//

//rename with [] and variable name to use the value of variable
export default function handler(req, res) {
  
const tokenId = req.query.tokenId;

const name = 'Crypto Dev #${tokenId}';
const description = "CryptoDevs is a NFT collection for web3 developers";
const image = 'https://raw.githubusercontent.com/LearnWeb3DAO/NFT-Collection/main/my-app/public/cryptodevs/${Number(tokenId)-1}.svg';

return res.json({
  name: name,
  description: description,
  image: image,
});
}


