import PDFDocument from "pdfkit";

const buildPDF = (voter, dataCallBack, endCallback) => {
  const logo = `public/images/slip_logo.png`;
  const name = voter?.Name || "N/A";
  const orgID = voter?.AccountNumber || "?";
  const serialNumber = voter?.SerialNumber || "?";
  const counterNumber = voter?.CounterNumber || "1";
  const imagePath = voter?.PhotoURL
    ? `public/${voter?.PhotoURL}`
    : "public/images/avatar.png";

  const doc = new PDFDocument({
    size: [250 * 3.78, 4000], // 80mm width, height can be adjusted as needed
    margins: {
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    info: {
      Title: "Election",
      Author: "Shahidul Deowan",
      Subject: "Voter slip",
      Keywords: "Electronic Arts and Technology Services",
      Creator: "Shahidul Deowan",
      Producer: "Deowan",
      CreationDate: new Date(),
      ModDate: new Date(),
    },
  });

  doc.on("data", dataCallBack);
  doc.on("end", endCallback);

  doc.image(logo, 360, doc.y, {
    fit: [180, 180],
    align: "center",
    valign: "center",
  });

  doc
    .moveDown(15)
    .font("Helvetica-Bold")
    .fontSize(38)
    .text("OFFICE OF THE ELECTION COMMISSION 2023-2024", { align: "center" });

  doc
    .font("Helvetica-Bold")
    .fontSize(60)
    .text("DHAKA CLUB LIMITED", { align: "center" })
    .moveDown()
    .lineWidth(5)
    .lineJoin("miter")
    // .rect(170, 365, 600, 100)
    .rect(272, 365, 400, 100)
    .stroke()
    .text("VOTER SLIP", { align: "center" });
  const imageWidth = 180 * 3.78;
  const docWidth = 250 * 3.78;
  const x = (docWidth - imageWidth) / 1.9 + 85;

  doc.moveDown().image(imagePath, 200, doc.y, {
    fit: [imageWidth, imageWidth],
  });

  doc.moveDown();
  doc.moveDown();
  doc.moveDown();
  doc.moveDown();
  doc.moveDown();
  doc.moveDown();
  doc.moveDown();
  doc.moveDown();
  doc.moveDown();
  doc.moveDown();

  doc
    .moveDown()
    .fontSize(55)
    .font("Helvetica-Bold")
    .text(`${name}`, { align: "center" })
    .text(`${orgID}`, { align: "center" })
    .text(`Serial No: ${serialNumber}`, { align: "center" })
    .text(`Counter No: ${counterNumber}`, { align: "center" });

  doc
    .moveDown()
    .fontSize(45)
    .text("ATTENTION", { align: "center" })
    .text("01. No photography inside the polling booth")
    .text("02. No use of mobile phone inside the booth");

  doc
    .moveDown()
    .moveDown()
    .moveDown()
    .lineWidth(5)
    .lineCap("butt")
    .moveTo(200, 1960)
    .lineTo(750, 1960)
    .stroke()
    .text("Verified By", { align: "center" })
    .text("Election Commissioner", {
      align: "center",
    })
    .text("Election Commission 2023-2024", { align: "center" });

  doc.moveDown();

  doc
    .moveDown()
    .fontSize(30)
    .text(`Print Date & Time: ${new Date().toLocaleString()}`, {
      align: "center",
    });

  doc.end();
};

export default buildPDF;
