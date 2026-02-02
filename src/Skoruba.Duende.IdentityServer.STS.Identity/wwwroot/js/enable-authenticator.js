(function () {
  var qrTarget = document.getElementById("qrCode");
  var qrData = document.getElementById("qrCodeData");

  if (!qrTarget || !qrData) return;

  var uri = qrData.getAttribute("data-url");
  if (!uri) return;

  if (typeof QRCode === "undefined") return;

  new QRCode(qrTarget, {
    text: uri,
    width: 300,
    height: 300,
  });
})();

