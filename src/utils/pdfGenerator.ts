import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Quotation, AppSettings, Language } from '../types';
import { formatCurrency, getItemUnitPriceDetail } from './calculations';

// Create a high-res QuickSurfaces vector logo Data URI on canvas for PDF embedding
export function generateLogoDataUrl(): string {
  const canvas = document.createElement('canvas');
  // SVG viewBox is 0 0 403 58. Render at 2x resolution (806 x 116)
  canvas.width = 806;
  canvas.height = 116;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.scale(2, 2);

  // 1. Black circle ring with evenodd fill
  const circlePath = new Path2D("M29 55C43.3594 55 55 43.3594 55 29C55 14.6406 43.3594 3 29 3C14.6406 3 3 14.6406 3 29C3 43.3594 14.6406 55 29 55ZM29 58C45.0163 58 58 45.0163 58 29C58 12.9837 45.0163 0 29 0C12.9837 0 0 12.9837 0 29C0 45.0163 12.9837 58 29 58Z");
  ctx.fillStyle = '#181818';
  ctx.fill(circlePath, 'evenodd');

  // 2. Three orange diagonal planks
  const orangePaths = [
    "M50.9978 33.937H38.491L33.3832 15.7129H39.0327L50.9978 33.937Z",
    "M7.16016 33.937H19.7045L24.8439 15.7129H19.145L7.16016 33.937Z",
    "M32.7332 18.9111H25.5557L20.778 42.5058H37.4101L32.7332 18.9111Z"
  ];
  ctx.fillStyle = '#FF8407';
  for (const p of orangePaths) {
    ctx.fill(new Path2D(p));
  }

  // 3. Black lettering paths
  const letterPaths = [
    "M85.6492 48.5166H86.9683C86.5248 48.5166 86.0842 48.4998 85.6492 48.4746V48.5166Z",
    "M103.448 40.0279C105.538 37.0006 106.694 33.3551 106.694 29.5528V29.4493C106.694 19.0245 98.4961 10.5918 87.0728 10.5918C75.6496 10.5918 67.3477 19.1308 67.3477 29.5556V29.6591C67.3477 39.6754 74.918 47.8507 85.6492 48.4746C86.0842 48.4998 86.5248 48.5166 86.9683 48.5166C91.0868 48.5166 94.8352 47.3667 97.9538 45.383C97.9566 45.383 97.9622 45.3774 97.9622 45.3774C97.9679 45.3774 101.149 47.8479 101.149 47.8479H112.473L103.454 40.0279H103.448ZM87.07 41.0771C86.5842 41.0771 86.1096 41.0379 85.6463 40.982C79.85 40.2853 75.8586 35.3723 75.8586 29.5528V29.4493C75.8586 28.4728 75.9801 27.5299 76.1891 26.6234C77.3303 21.6964 81.4234 18.0285 86.9627 18.0285C93.5217 18.0285 98.1741 23.266 98.1741 29.5528V29.6563C98.1741 31.2651 97.9114 32.7423 97.386 34.1077C97.321 34.2755 97.2702 34.4462 97.1967 34.6085L91.0473 29.2086L85.9034 34.9974L85.909 35.003L91.8382 40.1146C90.4315 40.719 88.827 41.0743 87.0672 41.0743L87.07 41.0771Z",
    "M85.9162 35.0073L85.9125 35L85.9162 35.0073Z",
    "M199.529 47.8262L191.289 36.4838V47.8262H183V11.957H191.289V31.782L199.48 20.7789H209.708L198.463 34.351L209.805 47.8262H199.529Z",
    "M154 34.3021C154 31.4907 154.566 29.0348 155.697 26.9343C156.86 24.8339 158.459 23.2182 160.495 22.0871C162.563 20.9561 164.922 20.3906 167.572 20.3906C170.965 20.3906 173.793 21.2793 176.055 23.0566C178.349 24.8339 179.852 27.3383 180.563 30.5697H171.741C170.997 28.5016 169.559 27.4675 167.427 27.4675C165.908 27.4675 164.696 28.0653 163.791 29.261C162.887 30.4243 162.434 32.1047 162.434 34.3021C162.434 36.4994 162.887 38.196 163.791 39.3916C164.696 40.5549 165.908 41.1366 167.427 41.1366C169.559 41.1366 170.997 40.1025 171.741 38.0344H180.563C179.852 41.2012 178.349 43.6894 176.055 45.4991C173.76 47.3087 170.933 48.2135 167.572 48.2135C164.922 48.2135 162.563 47.648 160.495 46.517C158.459 45.386 156.86 43.7702 155.697 41.6698C154.566 39.5693 154 37.1134 154 34.3021Z",
    "M146.944 17.9673C145.49 17.9673 144.294 17.5472 143.357 16.707C142.452 15.8345 142 14.7682 142 13.5079C142 12.2153 142.452 11.1489 143.357 10.3087C144.294 9.43625 145.49 9 146.944 9C148.366 9 149.529 9.43625 150.434 10.3087C151.371 11.1489 151.84 12.2153 151.84 13.5079C151.84 14.7682 151.371 15.8345 150.434 16.707C149.529 17.5472 148.366 17.9673 146.944 17.9673ZM151.064 20.7787V47.826H142.776V20.7787H151.064Z",
    "M137.482 20.7783V47.8256H129.193V44.1418C128.353 45.3374 127.206 46.3068 125.751 47.0501C124.33 47.761 122.746 48.1165 121.001 48.1165C118.933 48.1165 117.107 47.664 115.524 46.7592C113.94 45.8221 112.712 44.4811 111.84 42.7361C110.967 40.9911 110.531 38.9391 110.531 36.5801V20.7783H118.771V35.4653C118.771 37.2749 119.24 38.6806 120.177 39.6823C121.114 40.6841 122.375 41.185 123.958 41.185C125.574 41.185 126.85 40.6841 127.787 39.6823C128.724 38.6806 129.193 37.2749 129.193 35.4653V20.7783H137.482Z",
    "M393.397 48.2148C390.457 48.2148 388.05 47.5686 386.176 46.2763C384.334 44.984 383.3 43.1424 383.074 40.7516H385.303C385.465 42.464 386.24 43.8209 387.63 44.8225C389.051 45.824 390.974 46.3248 393.397 46.3248C395.4 46.3248 396.983 45.824 398.146 44.8225C399.341 43.7886 399.939 42.5286 399.939 41.0424C399.939 40.0085 399.616 39.1685 398.97 38.5224C398.356 37.8439 397.581 37.327 396.644 36.9716C395.707 36.6162 394.431 36.2285 392.815 35.8085C390.877 35.2915 389.31 34.7908 388.114 34.3061C386.919 33.7892 385.901 33.03 385.061 32.0284C384.221 31.0269 383.801 29.6861 383.801 28.006C383.801 26.7783 384.173 25.6475 384.916 24.6137C385.659 23.5475 386.693 22.7075 388.017 22.0936C389.342 21.4798 390.844 21.1729 392.524 21.1729C395.271 21.1729 397.484 21.8675 399.164 23.2567C400.876 24.6137 401.797 26.5037 401.926 28.9268H399.745C399.648 27.1822 398.97 25.7606 397.71 24.6621C396.45 23.5637 394.705 23.0144 392.476 23.0144C390.602 23.0144 389.051 23.499 387.824 24.4683C386.596 25.4375 385.982 26.6168 385.982 28.006C385.982 29.2337 386.321 30.2353 387 31.0107C387.71 31.7538 388.567 32.3353 389.568 32.7553C390.602 33.143 391.959 33.563 393.639 34.0154C395.481 34.5 396.951 34.9846 398.049 35.4692C399.18 35.9215 400.133 36.6 400.908 37.5046C401.684 38.377 402.071 39.5562 402.071 41.0424C402.071 42.3993 401.7 43.627 400.957 44.7255C400.214 45.824 399.18 46.6802 397.855 47.294C396.531 47.9079 395.044 48.2148 393.397 48.2148Z",
    "M379.086 32.9007C379.086 34.0638 379.054 34.9361 378.989 35.5177H356.261C356.325 37.8762 356.842 39.8631 357.811 41.4786C358.781 43.094 360.057 44.3055 361.64 45.1132C363.223 45.9209 364.951 46.3248 366.825 46.3248C369.41 46.3248 371.575 45.6948 373.319 44.4348C375.064 43.1424 376.162 41.3978 376.615 39.2008H378.892C378.375 41.8824 377.051 44.0632 374.918 45.7432C372.786 47.391 370.088 48.2148 366.825 48.2148C364.37 48.2148 362.173 47.6656 360.234 46.5671C358.296 45.4686 356.777 43.9017 355.679 41.8663C354.58 39.7985 354.031 37.3916 354.031 34.6454C354.031 31.8992 354.564 29.5084 355.63 27.4729C356.729 25.4375 358.247 23.8867 360.186 22.8206C362.124 21.7221 364.338 21.1729 366.825 21.1729C369.345 21.1729 371.526 21.7221 373.368 22.8206C375.242 23.8867 376.663 25.3245 377.632 27.1337C378.602 28.9107 379.086 30.833 379.086 32.9007ZM376.905 33.7246C377.002 31.3984 376.582 29.4276 375.645 27.8122C374.741 26.1968 373.497 25.0014 371.914 24.226C370.331 23.4183 368.618 23.0144 366.777 23.0144C364.935 23.0144 363.223 23.4183 361.64 24.226C360.089 25.0014 358.813 26.1968 357.811 27.8122C356.842 29.4276 356.325 31.3984 356.261 33.7246H376.905Z",
    "M324.988 34.6454C324.988 31.8992 325.521 29.5084 326.588 27.4729C327.686 25.4375 329.188 23.8867 331.095 22.8206C333.033 21.7221 335.246 21.1729 337.734 21.1729C341.029 21.1729 343.727 21.9967 345.827 23.6444C347.959 25.2921 349.284 27.5053 349.801 30.2838H347.523C347.103 28.0222 346.005 26.2452 344.228 24.9529C342.483 23.6606 340.319 23.0144 337.734 23.0144C335.795 23.0144 334.035 23.4506 332.451 24.3229C330.868 25.1629 329.592 26.4714 328.623 28.2483C327.686 29.993 327.218 32.1253 327.218 34.6454C327.218 37.1977 327.686 39.3462 328.623 41.0909C329.592 42.8355 330.868 44.144 332.451 45.0163C334.035 45.8886 335.795 46.3248 337.734 46.3248C340.319 46.3248 342.483 45.6786 344.228 44.3863C346.005 43.094 347.103 41.317 347.523 39.0554H349.801C349.284 41.8016 347.959 44.0147 345.827 45.6948C343.695 47.3748 340.997 48.2148 337.734 48.2148C335.246 48.2148 333.033 47.6656 331.095 46.5671C329.188 45.4686 327.686 43.9017 326.588 41.8663C325.521 39.7985 324.988 37.3916 324.988 34.6454Z",
    "M295.094 34.6454C295.094 31.9315 295.627 29.5568 296.693 27.5214C297.791 25.486 299.294 23.919 301.2 22.8206C303.138 21.7221 305.335 21.1729 307.791 21.1729C310.569 21.1729 312.928 21.8513 314.866 23.2083C316.805 24.5652 318.162 26.2937 318.937 28.3937V21.5121H321.118V47.8271H318.937V40.897C318.162 43.0293 316.789 44.7901 314.818 46.1794C312.879 47.5363 310.537 48.2148 307.791 48.2148C305.335 48.2148 303.138 47.6656 301.2 46.5671C299.294 45.4363 297.791 43.8532 296.693 41.8178C295.627 39.7501 295.094 37.3593 295.094 34.6454ZM318.937 34.6454C318.937 32.3515 318.453 30.3322 317.483 28.5876C316.546 26.8106 315.254 25.4537 313.606 24.5167C311.959 23.5475 310.117 23.0629 308.082 23.0629C305.949 23.0629 304.075 23.5313 302.46 24.4683C300.845 25.3729 299.585 26.6976 298.68 28.4422C297.775 30.1868 297.323 32.2546 297.323 34.6454C297.323 37.0362 297.775 39.1039 298.68 40.8485C299.585 42.5932 300.845 43.934 302.46 44.8709C304.108 45.8079 305.982 46.2763 308.082 46.2763C310.117 46.2763 311.959 45.8079 313.606 44.8709C315.286 43.9017 316.595 42.5447 317.532 40.8001C318.469 39.0231 318.937 36.9716 318.937 34.6454Z",
    "M295.035 23.45H288.202V47.8266H286.021V23.45H282.047V21.5116H286.021V19.67C286.021 16.9238 286.715 14.8884 288.105 13.5637C289.494 12.2068 291.772 11.5283 294.938 11.5283V13.4668C292.418 13.4668 290.657 13.9514 289.655 14.9207C288.686 15.8899 288.202 17.473 288.202 19.67V21.5116H295.035V23.45Z",
    "M268.232 26.9394C268.878 25.0009 270.025 23.5309 271.672 22.5293C273.32 21.4954 275.42 20.9785 277.973 20.9785V23.2562H277.246C274.661 23.2562 272.512 23.9993 270.8 25.4855C269.088 26.9394 268.232 29.3302 268.232 32.6579V47.8266H266.051V21.5116H268.232V26.9394Z",
    "M261.487 21.5117V47.8267H259.306V42.1082C258.563 44.1113 257.319 45.6459 255.574 46.7121C253.862 47.746 251.891 48.2629 249.662 48.2629C246.528 48.2629 243.959 47.3098 241.956 45.4036C239.985 43.4651 239 40.6059 239 36.8258V21.5117H241.132V36.6804C241.132 39.8143 241.924 42.2213 243.507 43.9013C245.09 45.549 247.239 46.3729 249.952 46.3729C252.796 46.3729 255.057 45.4682 256.737 43.659C258.45 41.8497 259.306 39.1681 259.306 35.6142V21.5117H261.487Z",
    "M224.135 48.2942C221.754 48.2942 219.67 47.8735 217.884 47.0321C216.098 46.1907 214.697 45.0513 213.681 43.6138C212.7 42.1764 212.14 40.5812 212 38.8282H214.469C214.749 40.7565 215.642 42.4744 217.148 43.982C218.689 45.4895 221.018 46.2433 224.135 46.2433C225.957 46.2433 227.533 45.9102 228.864 45.2441C230.229 44.578 231.28 43.6664 232.016 42.5095C232.751 41.3525 233.119 40.0728 233.119 38.6705C233.119 36.8825 232.681 35.4626 231.805 34.4108C230.965 33.359 229.897 32.5702 228.601 32.0443C227.34 31.5184 225.624 30.9574 223.453 30.3614C221.071 29.7304 219.145 29.0993 217.674 28.4682C216.238 27.8372 215.012 26.873 213.996 25.5759C213.016 24.2436 212.525 22.4381 212.525 20.1592C212.525 18.4062 212.981 16.8111 213.891 15.3736C214.837 13.9011 216.168 12.7442 217.884 11.9028C219.6 11.0613 221.579 10.6406 223.82 10.6406C227.077 10.6406 229.704 11.447 231.7 13.0597C233.697 14.6724 234.888 16.6533 235.273 19.0023H232.751C232.541 18.0557 232.068 17.0915 231.333 16.1099C230.632 15.1282 229.617 14.3218 228.286 13.6908C226.99 13.0247 225.431 12.6916 223.61 12.6916C221.159 12.6916 219.092 13.3752 217.411 14.7426C215.73 16.0748 214.889 17.8628 214.889 20.1066C214.889 21.8946 215.327 23.3321 216.203 24.4189C217.078 25.4707 218.147 26.277 219.407 26.838C220.703 27.3639 222.437 27.9073 224.608 28.4682C227.025 29.1344 228.934 29.783 230.335 30.414C231.77 31.01 232.979 31.9742 233.959 33.3064C234.975 34.6036 235.483 36.3741 235.483 38.6179C235.483 40.2657 235.045 41.8258 234.17 43.2983C233.294 44.7708 231.998 45.9803 230.282 46.9269C228.601 47.8385 226.552 48.2942 224.135 48.2942Z"
  ];
  ctx.fillStyle = '#181818';
  for (const p of letterPaths) {
    ctx.fill(new Path2D(p));
  }

  return canvas.toDataURL('image/png');
}

export function generateQuotePDF(quote: Quotation, settings: AppSettings, lang: Language = 'en'): jsPDF {
  const isEn = lang === 'en';
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;

  // Add logo matching application logo exactly
  const logoData = generateLogoDataUrl();
  if (logoData) {
    // 403x58 aspect ratio: width 65mm, height 9.35mm
    doc.addImage(logoData, 'PNG', margin, 13, 65, 9.35);
  }

  // Header Right: Quote Title & Details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(26, 26, 26);
  doc.text(isEn ? 'QUOTATION' : 'COTIZACIÓN', pageWidth - margin, 18, { align: 'right' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`No. ${quote.quoteNumber}`, pageWidth - margin, 24, { align: 'right' });
  doc.text(`${isEn ? 'Date:' : 'Fecha:'} ${quote.date}`, pageWidth - margin, 29, { align: 'right' });
  doc.text(`${isEn ? 'Valid Until:' : 'Válido hasta:'} ${quote.validUntil} (${quote.validDays} ${isEn ? 'days' : 'días'})`, pageWidth - margin, 34, { align: 'right' });

  // Divider line
  doc.setDrawColor(255, 132, 7); // Brand orange
  doc.setLineWidth(0.8);
  doc.line(margin, 38, pageWidth - margin, 38);

  // Info Grid: Client & Company
  // Left: Client info box
  doc.setFillColor(248, 249, 250);
  doc.roundedRect(margin, 42, (pageWidth - margin * 2) / 2 - 3, 30, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 132, 7);
  doc.text(isEn ? 'CLIENT INFORMATION (BILLING)' : 'DATOS DEL CLIENTE (FACTURACIÓN)', margin + 4, 48);

  doc.setFontSize(10);
  doc.setTextColor(26, 26, 26);
  const clientDisplayName = (quote.client.name || (isEn ? 'Private Client' : 'Cliente Particular')) + 
    (quote.client.clientType ? ` [${quote.client.clientType}]` : '');
  doc.text(clientDisplayName, margin + 4, 54);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(80, 80, 80);
  if (quote.client.phone) {
    doc.text(`${isEn ? 'Phone:' : 'Teléfono:'} ${quote.client.phone}`, margin + 4, 59);
  }
  if (quote.client.email) {
    doc.text(`Email: ${quote.client.email}`, margin + 4, 64);
  }
  if (quote.client.address) {
    doc.text(`${isEn ? 'Address:' : 'Dirección:'} ${quote.client.address}`, margin + 4, 69);
  }

  // Right: QuickSurfaces / Salesperson info box
  const rightBoxX = margin + (pageWidth - margin * 2) / 2 + 3;
  doc.setFillColor(248, 249, 250);
  doc.roundedRect(rightBoxX, 42, (pageWidth - margin * 2) / 2 - 3, 30, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 132, 7);
  doc.text(isEn ? 'ISSUER & SALES CONSULTANT' : 'EMISOR & ASESOR COMERCIAL', rightBoxX + 4, 48);

  doc.setFontSize(9.5);
  doc.setTextColor(26, 26, 26);
  doc.text('QuickSurfaces Miami', rightBoxX + 4, 54);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  doc.text(settings.companyAddress, rightBoxX + 4, 59);
  doc.text(`${isEn ? 'Consultant:' : 'Asesor:'} ${quote.salespersonName || settings.salespersonName} | Tel: ${quote.salespersonPhone || settings.salespersonPhone}`, rightBoxX + 4, 64);
  doc.text(`Email: ${settings.companyEmail}`, rightBoxX + 4, 69);

  // Shipping Address Block (If provided or different)
  let currentY = 76;
  const shippingAddr = (quote.shippingAddress || (quote.sameAsBillingAddress ? quote.client.address : ''))?.trim();
  if (shippingAddr) {
    doc.setFillColor(242, 241, 236); // #F2F1EC warm neutral
    doc.roundedRect(margin, currentY, pageWidth - margin * 2, 13, 1.5, 1.5, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 132, 7); // Brand orange
    doc.text(
      isEn ? 'SHIPPING / DELIVERY ADDRESS (DIRECCIÓN DE ENTREGA):' : 'DIRECCIÓN DE ENTREGA (SHIPPING ADDRESS):',
      margin + 4,
      currentY + 4.8
    );

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(24, 24, 24);
    doc.text(shippingAddr, margin + 4, currentY + 9.8);

    currentY += 17;
  } else {
    currentY += 2;
  }

  // Table of Products & Services
  const tableRows = quote.items.map((item, index) => {
    let desc = item.productName;
    if (item.thickness) desc += ` (${item.thickness})`;
    if (item.color) desc += `\nColor: ${item.color.code} - ${item.color.name}`;
    if (item.stepIncludesRiser) desc += isEn ? `\nIncludes: Step + Matching Flush Riser` : `\nIncluye: Peldaño + Contrahuella (Riser)`;
    if (item.notes) desc += isEn ? `\nNote: ${item.notes}` : `\nNota: ${item.notes}`;

    let qtyText = `${item.userEnteredQuantity} ${item.quantityUnitLabel}`;
    if (item.calculatedUnitsLabel && item.calculatedUnitsLabel.trim() !== `${item.userEnteredQuantity} ${item.quantityUnitLabel}`.trim()) {
      qtyText += `\n${item.calculatedUnitsLabel}`;
    }

    const priceDetail = getItemUnitPriceDetail(item, isEn ? 'en' : 'es');
    let priceText = priceDetail.primaryRate;
    if (priceDetail.packagingRate) {
      priceText += `\n(${priceDetail.packagingRate})`;
    }

    const subtotalText = formatCurrency(item.subtotal);

    return [
      (index + 1).toString(),
      desc,
      qtyText,
      priceText,
      subtotalText
    ];
  });

  const tableHead = isEn 
    ? [['#', 'Product / Service Description', 'Quantity & Dispatch Specs', 'Unit Price', 'Subtotal']]
    : [['#', 'Descripción del Producto / Servicio', 'Cantidad Solicitada & Despacho', 'Precio Unit.', 'Subtotal']];

  autoTable(doc, {
    startY: currentY,
    head: tableHead,
    body: tableRows,
    theme: 'striped',
    headStyles: {
      fillColor: [26, 26, 26],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'left'
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 50, halign: 'left' },
      3: { cellWidth: 32, halign: 'right' },
      4: { cellWidth: 26, halign: 'right', fontStyle: 'bold' }
    },
    styles: {
      fontSize: 8,
      cellPadding: 3,
      valign: 'middle',
      textColor: [40, 40, 40]
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250]
    },
    margin: { left: margin, right: margin }
  });

  // Calculate position after table
  // @ts-expect-error autoTable adds lastAutoTable to jsPDF instance
  let finalY = doc.lastAutoTable.finalY + 6;

  if (finalY > 220) {
    doc.addPage();
    finalY = 20;
  }

  // Summary Totals Card on the right
  const summaryWidth = 98;
  const summaryX = pageWidth - margin - summaryWidth;

  let summaryRowCount = 2; // Subtotal Products + Tax
  if (quote.includeDelivery) summaryRowCount += 1;
  if (quote.installationTotal > 0) summaryRowCount += 1;
  if (quote.payWithCard && (quote.cardFeeAmount ?? 0) > 0) summaryRowCount += 1;

  const summaryBoxHeight = 18 + (summaryRowCount * 6.2);

  doc.setFillColor(248, 249, 250);
  doc.setDrawColor(230, 230, 230);
  doc.roundedRect(summaryX, finalY, summaryWidth, summaryBoxHeight, 2, 2, 'FD');

  let currentTotalY = finalY + 6;
  doc.setFontSize(8.5);

  // Subtotal Productos
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text(isEn ? 'Products Subtotal (Taxable):' : 'Subtotal Materiales (Gravable):', summaryX + 4, currentTotalY);
  doc.setTextColor(26, 26, 26);
  doc.text(formatCurrency(quote.subtotalProducts), pageWidth - margin - 4, currentTotalY, { align: 'right' });

  // Delivery (Fixed rate, Tax Exempt / No Tax)
  if (quote.includeDelivery) {
    currentTotalY += 6;
    doc.setTextColor(80, 80, 80);
    doc.text(isEn ? 'Delivery Fee (No Tax):' : 'Delivery Fijo (No Tax):', summaryX + 4, currentTotalY);
    doc.setTextColor(26, 26, 26);
    doc.text(formatCurrency(quote.deliveryCost), pageWidth - margin - 4, currentTotalY, { align: 'right' });
  }

  // Sales Tax 7% (on Products only, Delivery is No Tax)
  currentTotalY += 6;
  doc.setTextColor(80, 80, 80);
  doc.text(isEn ? `FL Sales Tax (7% on products):` : `Impuesto Sales Tax (7% s/materiales):`, summaryX + 4, currentTotalY);
  doc.setTextColor(26, 26, 26);
  doc.text(formatCurrency(quote.taxAmount), pageWidth - margin - 4, currentTotalY, { align: 'right' });

  // Installation (Labor / Tax Exempt)
  if (quote.installationTotal > 0) {
    currentTotalY += 6;
    doc.setTextColor(80, 80, 80);
    doc.text(isEn ? 'Labor / Services (Tax Exempt):' : 'Instalación / Servicios (Exento):', summaryX + 4, currentTotalY);
    doc.setTextColor(26, 26, 26);
    doc.text(formatCurrency(quote.installationTotal), pageWidth - margin - 4, currentTotalY, { align: 'right' });
  }

  // 3% Debit / Credit Card Convenience Fee
  if (quote.payWithCard && (quote.cardFeeAmount ?? 0) > 0) {
    currentTotalY += 6;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(224, 115, 0); // QuickSurfaces orange
    doc.text(isEn ? 'Card Surcharge (3% Debit/Credit):' : 'Recargo Tarjeta Débito/Crédito (3%):', summaryX + 4, currentTotalY);
    doc.text(`+${formatCurrency(quote.cardFeeAmount)}`, pageWidth - margin - 4, currentTotalY, { align: 'right' });
    doc.setFont('helvetica', 'normal');
  }

  // Total Line
  currentTotalY += 7;
  doc.setDrawColor(255, 132, 7);
  doc.line(summaryX + 4, currentTotalY - 2, pageWidth - margin - 4, currentTotalY - 2);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 132, 7);
  doc.text(isEn ? 'TOTAL ESTIMATE:' : 'TOTAL:', summaryX + 4, currentTotalY + 3);
  doc.setTextColor(26, 26, 26);
  doc.text(formatCurrency(quote.total), pageWidth - margin - 4, currentTotalY + 3, { align: 'right' });

  // Left Side Payment Methods & Legal Warning Box
  const leftBoxWidth = summaryX - margin - 6;
  const bottomBoxHeight = Math.max(summaryBoxHeight, 52);

  doc.setFillColor(255, 248, 240); // Soft orange/warm cream tint
  doc.setDrawColor(255, 180, 100);
  doc.roundedRect(margin, finalY, leftBoxWidth, bottomBoxHeight, 2, 2, 'FD');

  let leftY = finalY + 5;

  // 1. Payment Methods Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(224, 115, 0); // Dark orange
  doc.text(isEn ? 'PAYMENT METHODS' : 'MÉTODOS DE PAGO', margin + 4, leftY);

  leftY += 4.5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(24, 24, 24);
  doc.text('Zelle: quickzelle@gmail.com', margin + 4, leftY);

  leftY += 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(80, 80, 80);
  doc.text(`${isEn ? 'Account Name:' : 'Titular:'} Brugge International`, margin + 4, leftY);

  leftY += 3.8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(60, 60, 60);
  const otherPayText = isEn
    ? 'Also accepted: Cash & Card / POS (+3% debit/credit convenience fee).'
    : 'Aceptamos también Efectivo y Punto de Venta (+3% con tarjeta débito o crédito).';
  doc.text(otherPayText, margin + 4, leftY);

  // Subtle separator line
  leftY += 3;
  doc.setDrawColor(240, 210, 180);
  doc.setLineWidth(0.3);
  doc.line(margin + 4, leftY, margin + leftBoxWidth - 4, leftY);

  // 2. Terms & Conditions Section
  leftY += 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.text(isEn ? 'TERMS & CONDITIONS' : 'TÉRMINOS Y CONDICIONES', margin + 4, leftY);

  leftY += 3.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(90, 90, 90);
  
  const legalText = isEn
    ? `Reference estimate valid for ${quote.validDays} days (until ${quote.validUntil}). Prices & inventory subject to change. Demolition, leveling and labor excluded unless itemized.`
    : `Estimado referencial válido por ${quote.validDays} días (hasta ${quote.validUntil}). Precios e inventario sujetos a cambio. No incluye demolición o nivelación salvo especificado.`;
  
  const splitLegal = doc.splitTextToSize(legalText, leftBoxWidth - 8);
  doc.text(splitLegal, margin + 4, leftY);

  // Footer on bottom of page
  const footerY = doc.internal.pageSize.getHeight() - 10;
  doc.setFontSize(7.5);
  doc.setTextColor(140, 140, 140);
  doc.text('QuickSurfaces - Luxury Flooring & Surfaces | Miami, FL | www.quicksurfaces.com', margin, footerY);
  doc.text(isEn ? 'Page 1 of 1' : 'Página 1 de 1', pageWidth - margin, footerY, { align: 'right' });

  return doc;
}

export function generateWhatsAppMessage(quote: Quotation, lang: Language = 'en'): string {
  const isEn = lang === 'en';

  let message = `*QUICKSURFACES ${isEn ? 'QUOTATION' : 'COTIZACIÓN'}*\n`;
  message += `📄 ${isEn ? 'Quote' : 'Cotización'}: *#${quote.quoteNumber}*\n`;
  message += `👤 ${isEn ? 'Client' : 'Cliente'}: *${quote.client.name}*\n`;
  message += `📅 ${isEn ? 'Date' : 'Fecha'}: ${quote.date} (${isEn ? `Valid for ${quote.validDays} days` : `Válido por ${quote.validDays} días`})\n\n`;
  
  message += `*${isEn ? 'ITEMIZED BREAKDOWN:' : 'DETALLE DE PRODUCTOS:'}*\n`;
  quote.items.forEach((item) => {
    const detail = getItemUnitPriceDetail(item, isEn ? 'en' : 'es');
    message += `▪️ *${item.productName}*`;
    if (item.color) message += ` (${item.color.name})`;
    message += `\n   ${item.calculatedUnitsLabel}`;
    message += `\n   ${isEn ? 'Unit Price' : 'Precio Unit.'}: ${detail.primaryRate}${detail.packagingRate ? ` (${detail.packagingRate})` : ''} | Subtotal: ${formatCurrency(item.subtotal)}\n`;
  });

  message += `\n*${isEn ? 'FINANCIAL SUMMARY:' : 'RESUMEN:'}*\n`;
  message += `▫️ ${isEn ? 'Products Subtotal' : 'Subtotal Materiales'}: ${formatCurrency(quote.subtotalProducts)}\n`;
  if (quote.includeDelivery) {
    message += `▫️ ${isEn ? 'Delivery' : 'Delivery Fijo'}: ${formatCurrency(quote.deliveryCost)}\n`;
  }
  message += `▫️ ${isEn ? 'FL Sales Tax (7%)' : 'Impuesto (7%)'}: ${formatCurrency(quote.taxAmount)}\n`;
  if (quote.installationTotal > 0) {
    message += `▫️ ${isEn ? 'Labor / Services' : 'Instalación/Servicios'}: ${formatCurrency(quote.installationTotal)}\n`;
  }
  if (quote.payWithCard && (quote.cardFeeAmount ?? 0) > 0) {
    message += `▫️ 💳 ${isEn ? 'Card Surcharge (3% Debit/Credit)' : 'Recargo Tarjeta Débito/Crédito (3%)'}: +${formatCurrency(quote.cardFeeAmount)}\n`;
  }
  message += `\n💰 *TOTAL: ${formatCurrency(quote.total)}*\n\n`;

  // Payment Methods Section
  message += `💳 *${isEn ? 'PAYMENT METHODS:' : 'MÉTODOS DE PAGO:'}*\n`;
  message += `▫️ *Zelle:* quickzelle@gmail.com\n   ${isEn ? 'Account Name' : 'Titular'}: *Brugge International*\n`;
  message += `▫️ ${isEn ? 'We also accept Cash and POS / Card (+3% debit/credit card fee).' : 'También aceptamos Efectivo y Punto de Venta / Tarjeta (+3% con tarjeta).'}\n\n`;

  message += `⚠️ _${isEn ? `Reference estimate valid until ${quote.validUntil}.` : `Estimado referencial sujeto a cambio sin previo aviso. Válido hasta ${quote.validUntil}.`}_\n`;
  message += isEn ? `Thank you for choosing QuickSurfaces!` : `¡Gracias por preferir QuickSurfaces!`;

  return message;
}

export function openWhatsAppShare(quote: Quotation, phoneNumber?: string, lang: Language = 'en'): void {
  const message = generateWhatsAppMessage(quote, lang);
  const encoded = encodeURIComponent(message);
  
  // Clean phone number (digits only)
  const cleanPhone = (phoneNumber || quote.client.phone || '').replace(/\D/g, '');
  
  let url = `https://wa.me/?text=${encoded}`;
  if (cleanPhone.length >= 10) {
    const finalPhone = cleanPhone.length === 10 ? `1${cleanPhone}` : cleanPhone;
    url = `https://wa.me/${finalPhone}?text=${encoded}`;
  }

  window.open(url, '_blank', 'noopener,noreferrer');
}
