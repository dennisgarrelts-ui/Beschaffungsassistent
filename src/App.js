import React, { useState, useRef } from 'react';
import { 
  Search, 
  ShoppingCart, 
  MapPin, 
  Building2, 
  Trash2, 
  Package, 
  Loader2,
  AlertCircle,
  Plus,
  Download,
  FileSpreadsheet,
  PlusCircle,
  X,
  FileText,
  ClipboardSignature
} from 'lucide-react';

// Konstanten für die Shops inkl. Adressen, Telefon und E-Mail
const SHOPS = {
  conrad: {
    id: 'conrad',
    name: 'Conrad Electronic SE',
    address: 'Klaus-Conrad-Str. 1, 92240 Hirschau',
    phone: '09604 408787',
    email: 'info@conrad.de',
    domain: 'conrad.de'
  },
  reichelt: {
    id: 'reichelt',
    name: 'Reichelt Elektronik GmbH',
    address: 'Elektronikring 1, 26452 Sande',
    phone: '04422 955-333',
    email: 'info@reichelt.de',
    domain: 'reichelt.de'
  },
  hoffmann: {
    id: 'hoffmann',
    name: 'Hoffmann Group',
    address: 'Haberlandstraße 55, 81241 München',
    phone: '089 8391-0',
    email: 'info@hoffmann-group.com',
    domain: 'hoffmann-group.com'
  },
  rs: {
    id: 'rs',
    name: 'RS Components GmbH',
    address: 'Mainzer Landstraße 180, 60327 Frankfurt am Main',
    phone: '069 5800 14 234',
    email: 'bestellung@rs-components.com',
    domain: 'de.rs-online.com'
  }
};

export default function App() {
  const [shops, setShops] = useState(SHOPS);
  const [selectedShopId, setSelectedShopId] = useState('reichelt'); // Standardmäßig Reichelt wie im Beispiel
  const [isAddingShop, setIsAddingShop] = useState(false);
  
  const [newShopName, setNewShopName] = useState('');
  const [newShopAddress, setNewShopAddress] = useState('');
  const [newShopPhone, setNewShopPhone] = useState('');
  const [newShopEmail, setNewShopEmail] = useState('');
  
  // Artikel-Eingabe State
  const [articleNr, setArticleNr] = useState('');
  const [mpn, setMpn] = useState(''); // State für Herstellerteilenummer
  const [articleName, setArticleName] = useState('');
  const [priceGrossInput, setPriceGrossInput] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [items, setItems] = useState([]);
  
  // Neue Antragsdaten State
  const [lagerort, setLagerort] = useState('EGS 1');
  const [begruendung, setBegruendung] = useState('');
  const [ansprechpartner, setAnsprechpartner] = useState('');
  const [telefon, setTelefon] = useState('');

  const [error, setError] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  
  const articleInputRef = useRef(null);
  const selectedShop = shops[selectedShopId];

  // Hilfsfunktion zur dynamischen Währungsformatierung (Deutsch)
  // Zeigt standardmäßig 2 Nachkommastellen an, erlaubt aber bis zu 5 (SAP-kompatibel)
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('de-DE', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 5 
    }).format(value);
  };

  // Formatierung für Netto (Stk.) (max 3 Nachkommastellen)
  const formatCurrencyNettoStk = (value) => {
    return new Intl.NumberFormat('de-DE', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 3 
    }).format(value);
  };

  // Formatierung für Gesamtbeträge (strikt 2 Nachkommastellen)
  const formatCurrencyTotal = (value) => {
    return new Intl.NumberFormat('de-DE', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2 
    }).format(value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!articleNr.trim() || !articleName.trim() || !priceGrossInput.trim()) {
       setError('Bitte füllen Sie alle erforderlichen Felder aus.');
       return;
    }

    setError('');

    // Preis normalisieren
    const normalizedPrice = priceGrossInput.replace(',', '.');
    const grossPrice = parseFloat(normalizedPrice);

    if (isNaN(grossPrice) || grossPrice < 0) {
      setError('Bitte geben Sie einen gültigen Einzelpreis ein.');
      return;
    }

    const netPrice = grossPrice / 1.19; 
    
    // Zum Warenkorb hinzufügen
    const newItem = {
      id: crypto.randomUUID(),
      shop: selectedShop.name,
      articleNr: articleNr.trim(),
      mpn: mpn.trim(),
      name: articleName.trim(),
      priceNet: netPrice,
      priceGross: grossPrice,
      quantity: parseInt(quantity, 10) || 1
    };

    setItems(prev => [...prev, newItem]);
    
    // Formular zurücksetzen & Fokus wieder auf Artikelnummer setzen
    setArticleNr('');
    setMpn('');
    setArticleName('');
    setPriceGrossInput('');
    setQuantity(1);
    
    if (articleInputRef.current) articleInputRef.current.focus();
  };

  const removeItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  // Berechnungen für die Gesamtsummen
  const totalNet = items.reduce((sum, item) => sum + (item.priceNet * item.quantity), 0);
  const totalGross = items.reduce((sum, item) => sum + (item.priceGross * item.quantity), 0);

  const handleAddShop = (e) => {
    e.preventDefault();
    if (!newShopName.trim() || !newShopAddress.trim()) return;
    
    const newId = `custom_${Date.now()}`;
    const newShop = {
      id: newId,
      name: newShopName.trim(),
      address: newShopAddress.trim(),
      phone: newShopPhone.trim(),
      email: newShopEmail.trim(),
      domain: ''
    };
    
    setShops(prev => ({ ...prev, [newId]: newShop }));
    setSelectedShopId(newId);
    setIsAddingShop(false);
    
    // Eingabefelder zurücksetzen
    setNewShopName('');
    setNewShopAddress('');
    setNewShopPhone('');
    setNewShopEmail('');
  };

  // Dynamischer Nummern-Formatierer für CSV-Export (ohne Tausendertrennzeichen, 2-5 Nachkommastellen)
  const formatCsvNumber = (value) => {
    return new Intl.NumberFormat('de-DE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 5,
      useGrouping: false
    }).format(value);
  };

  // CSV-Formatierer für Netto (Stk.) (max 3 Nachkommastellen)
  const formatCsvNumberNettoStk = (value) => {
    return new Intl.NumberFormat('de-DE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 3,
      useGrouping: false
    }).format(value);
  };

  // CSV-Formatierer für Gesamtbeträge (strikt 2 Nachkommastellen)
  const formatCsvNumberTotal = (value) => {
    return new Intl.NumberFormat('de-DE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: false
    }).format(value);
  };

  const handleExportCSV = () => {
    const headers = ['Artikelnummer', 'Herstellerteilenummer', 'Artikelname', 'Menge', 'Netto (Stk.)', 'Brutto (Stk.)', 'Netto (Gesamt)', 'Brutto (Gesamt)'];
    
    const rows = items.map(item => [
      `"${item.articleNr}"`,
      `"${item.mpn || ''}"`,
      `"${item.name.replace(/"/g, '""')}"`,
      item.quantity,
      formatCsvNumberNettoStk(item.priceNet),
      formatCsvNumber(item.priceGross),
      formatCsvNumberTotal(item.priceNet * item.quantity),
      formatCsvNumberTotal(item.priceGross * item.quantity)
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Bestellung_${selectedShop.name.replace(/[^a-zA-Z0-9]/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      // Lade native PDF-Bibliotheken (jsPDF + AutoTable) für echten, markierbaren Text
      if (!window.jspdf) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      
      // Hilfsfunktion für den PDF Export mit dynamischen Nachkommastellen
      const pdfFormatCurrency = (value) => {
        const formatted = new Intl.NumberFormat('de-DE', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 5
        }).format(value);
        return formatted + ' €';
      };

      // PDF Export Formatierung für Netto (Stk.) (max 3 Nachkommastellen)
      const pdfFormatCurrencyNettoStk = (value) => {
        const formatted = new Intl.NumberFormat('de-DE', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 3
        }).format(value);
        return formatted + ' €';
      };

      // PDF Export Formatierung für Gesamtbeträge (strikt 2 Nachkommastellen)
      const pdfFormatCurrencyTotal = (value) => {
        const formatted = new Intl.NumberFormat('de-DE', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(value);
        return formatted + ' €';
      };

      // --- 1. KOPFBEREICH (Rahmen) ---
      doc.setDrawColor(0);
      doc.setLineWidth(0.3);
      doc.rect(15, 15, 180, 25);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("Einheit, Teileinheit,", 18, 21);
      
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(`AusbWkst Weener / ${lagerort}`, 18, 28);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Lagerort: EFQ6-${lagerort.replace(' ', '')}`, 18, 35);

      doc.text("BAnfNr.:", 120, 21);
      doc.line(135, 21, 190, 21);
      doc.text("AuftrNr.:", 120, 29);
      doc.line(135, 29, 190, 29);

      // --- 2. TITEL ---
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Anforderungszettel „Dezentrale Beschaffung“", 105, 55, { align: "center" });
      doc.setLineWidth(0.5);
      doc.line(35, 57, 175, 57);

      // --- 3. ADRESSE & DATUM ---
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text("LIEFERANT/ ADRESSAT", 15, 70);
      doc.setLineWidth(0.2);
      doc.line(15, 71, 55, 71);

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(selectedShop.name, 15, 77);
      
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      const addressParts = selectedShop.address.split(', ');
      doc.text(addressParts[0] || '', 15, 83);
      doc.text(addressParts[1] || '', 15, 89);
      
      // Optionale Kontaktinformationen im PDF rendern
      let currentAddressY = 95;
      if (selectedShop.phone) {
        doc.setFontSize(10);
        doc.text(`Tel.: ${selectedShop.phone}`, 15, currentAddressY);
        currentAddressY += 5;
      }
      if (selectedShop.email) {
        doc.setFontSize(10);
        doc.text(`E-Mail: ${selectedShop.email}`, 15, currentAddressY);
      }

      const currentDate = new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("Ausbildungswerkstatt Weener", 195, 77, { align: "right" });
      doc.setFont("helvetica", "normal");
      doc.text("Rostocker Str. 12", 195, 83, { align: "right" });
      doc.text("26826 Weener", 195, 89, { align: "right" });
      doc.text(currentDate, 195, 95, { align: "right" });

      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text("Bestellübersicht", 15, 112); // Etwas tiefer gesetzt wegen Kontaktdaten

      // --- 4. TABELLE ---
      doc.autoTable({
        startY: 116,
        head: [['Artikel', 'Menge', 'Netto (Stk.)', 'Brutto (Stk.)', 'Netto (Ges.)', 'Brutto (Ges.)']],
        body: items.map(item => {
          // Ein unsichtbarer Platzhalter, damit die Tabelle die Zeilenhöhe korrekt berechnet
          let dummyText = `${item.name}\nArt.-Nr: ${item.articleNr}`;
          if (item.mpn) {
            dummyText += `\nHerst.-Nr: ${item.mpn}`;
          }
          return [
            dummyText,
            `${item.quantity}x`,
            pdfFormatCurrencyNettoStk(item.priceNet),
            pdfFormatCurrency(item.priceGross),
            pdfFormatCurrencyTotal(item.priceNet * item.quantity),
            pdfFormatCurrencyTotal(item.priceGross * item.quantity)
          ];
        }),
        foot: [[
          '',
          '',
          '',
          'Summen:',
          pdfFormatCurrencyTotal(totalNet),
          pdfFormatCurrencyTotal(totalGross)
        ]],
        theme: 'grid',
        headStyles: { fillColor: [240, 240, 240], textColor: 0, fontStyle: 'bold', lineColor: [0, 0, 0], lineWidth: 0.3 },
        bodyStyles: { textColor: 0, lineColor: [150, 150, 150] },
        footStyles: { fillColor: [245, 245, 245], textColor: 0, fontStyle: 'bold', lineColor: [0, 0, 0], lineWidth: 0.3, halign: 'right' },
        columnStyles: {
          0: { cellWidth: 70 },
          1: { cellWidth: 15, halign: 'center', valign: 'middle' },
          2: { cellWidth: 22, halign: 'right', valign: 'middle' },
          3: { cellWidth: 22, halign: 'right', valign: 'middle' },
          4: { cellWidth: 24, halign: 'right', valign: 'middle' },
          5: { halign: 'right', valign: 'middle' }
        },
        styles: { fontSize: 9, font: "helvetica" },
        // --- MANUELLES ZEICHNEN FÜR FETTDRUCK IN DER PDF ---
        willDrawCell: function (data) {
          // Unterdrückt den Standard-Text für Spalte 0, damit wir ihn selbst zeichnen können
          if (data.section === 'body' && data.column.index === 0) {
            data.cell.text = [];
          }
        },
        didDrawCell: function (data) {
          if (data.section === 'body' && data.column.index === 0) {
            const item = items[data.row.index];
            const startX = data.cell.x + 1.5; // Leichtes Padding links
            let currentY = data.cell.y + 4.5; // Baseline der ersten Zeile
            
            // 1. Artikelbeschreibung in FETT
            doc.setFontSize(9);
            doc.setFont("helvetica", "bold");
            const nameLines = doc.splitTextToSize(item.name, data.cell.width - 3);
            doc.text(nameLines, startX, currentY);
            currentY += (nameLines.length * 3.5);
            
            // 2. Artikelnummer (Label FETT, Wert NORMAL)
            doc.setFontSize(8.5);
            doc.setFont("helvetica", "bold");
            doc.text("Art.-Nr: ", startX, currentY);
            const artNrWidth = doc.getTextWidth("Art.-Nr: ");
            doc.setFont("helvetica", "normal");
            doc.text(item.articleNr, startX + artNrWidth, currentY);
            currentY += 3.5;
            
            // 3. Herstellerteilenummer (Label FETT, Wert NORMAL)
            if (item.mpn) {
              doc.setFont("helvetica", "bold");
              doc.text("Herst.-Nr: ", startX, currentY);
              const mpnWidth = doc.getTextWidth("Herst.-Nr: ");
              doc.setFont("helvetica", "normal");
              doc.text(item.mpn, startX + mpnWidth, currentY);
            }
          }
        }
      });

      // --- 5. FUSSBEREICH (Rahmen für Begründung) ---
      const finalY = doc.lastAutoTable.finalY || 116;
      const bottomY = finalY + 15;
      
      doc.setFontSize(10);
      
      // Text automatisch umbrechen lassen (maximal 110mm Breite für die Eingaben)
      const begruendungLines = doc.splitTextToSize(begruendung || ' ', 110);
      const ansprechLines = doc.splitTextToSize(ansprechpartner || ' ', 110);
      const telefonLines = doc.splitTextToSize(telefon || ' ', 110);

      let currentY = bottomY + 7;

      // Hilfsfunktion: Zeichnet mehrzeiligen Text inkl. passender Unterstriche pro Zeile
      const drawWrappedText = (label, lines, startY) => {
        doc.setFont("helvetica", "bold");
        doc.text(label, 18, startY);
        doc.setFont("helvetica", "normal");
        
        let stepY = startY;
        lines.forEach((lineText, index) => {
          doc.text(lineText, 75, stepY);
          doc.setLineWidth(0.2);
          doc.line(75, stepY + 1.5, 190, stepY + 1.5); // Unterstrich für diese Zeile
          if (index < lines.length - 1) {
             stepY += 6; // Zeilenabstand bei Umbruch
          }
        });
        return stepY;
      };

      currentY = drawWrappedText("Begründung der Anforderung:", begruendungLines, currentY);
      currentY += 8; // Abstand zum nächsten Block
      
      currentY = drawWrappedText("Empfänger / Ansprechpartner:", ansprechLines, currentY);
      currentY += 8;
      
      currentY = drawWrappedText("Erreichbarkeit (Tel.):", telefonLines, currentY);
      
      // Rahmenhöhe dynamisch berechnen basierend auf der tatsächlichen Textmenge
      const boxHeight = (currentY - bottomY) + 5;
      doc.setLineWidth(0.3);
      doc.rect(15, bottomY, 180, boxHeight);

      // --- 6. UNTERSCHRIFTEN ---
      // Unterschriften dynamisch nach unten schieben
      const sigY = bottomY + boxHeight + 20;
      doc.setLineWidth(0.3);

      doc.line(15, sigY, 65, sigY);
      doc.setFontSize(8);
      doc.text("Angefordert durch TEFhr\n(Unterschrift, Datum)", 40, sigY + 5, { align: "center" });

      doc.line(75, sigY, 135, sigY);
      doc.text("Ausgegeben durch\n(Unterschrift, Datum)", 105, sigY + 5, { align: "center" });

      doc.line(145, sigY, 195, sigY);
      doc.text("Empfangen durch\n(Unterschrift, Datum)", 170, sigY + 5, { align: "center" });

      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text("Seite 1 von 1", 195, 285, { align: "right" });

      // Download wird direkt erzwungen
      doc.save(`Anforderung_${lagerort.replace(' ', '')}_${selectedShop.name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
      
    } catch (err) {
      console.error("PDF-Export Fehler:", err);
      setError("Fehler beim Erstellen der PDF. Bitte versuchen Sie es erneut.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-200 text-slate-800 font-sans p-4 md:p-8">
      <div className="max-w-[1400px] mx-auto space-y-6">
        
        {/* Header */}
        <header className="flex items-center gap-3 pb-4 border-b border-slate-300">
          <div className="p-3 bg-blue-700 text-white rounded-lg shadow-sm">
            <ClipboardSignature size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Beschaffungs-Assistent</h1>
            <p className="text-sm text-slate-600">Offizieller Anforderungszettel "Dezentrale Beschaffung"</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Linke Spalte: Eingaben */}
          <div className="lg:col-span-4 space-y-6 print-hidden">
            
            {/* Shop & Antragsdaten kombiniert */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-slate-100 p-4 border-b border-slate-200">
                <h2 className="font-semibold text-slate-700 flex items-center gap-2">
                  <FileText size={18} /> Antragsdaten
                </h2>
              </div>
              <div className="p-4 space-y-5">
                
                {/* Lagerort Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Lagerort</label>
                  <select 
                    value={lagerort}
                    onChange={(e) => setLagerort(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium"
                  >
                    <option value="EGS 1">EGS 1</option>
                    <option value="EGS 2">EGS 2</option>
                    <option value="EGS 3">EGS 3</option>
                    <option value="EGS 4">EGS 4</option>
                  </select>
                </div>

                {/* Shop Auswahl */}
                <div className="pt-2 border-t border-slate-100">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Lieferant auswählen</label>
                  <select 
                    value={selectedShopId}
                    onChange={(e) => setSelectedShopId(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  >
                    {Object.values(shops).map(shop => (
                      <option key={shop.id} value={shop.id}>{shop.name}</option>
                    ))}
                  </select>
                  
                  {!isAddingShop ? (
                    <button 
                      onClick={() => setIsAddingShop(true)}
                      className="mt-2 flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <PlusCircle size={14} /> Neuen Händler hinzufügen
                    </button>
                  ) : (
                    <div className="mt-2 bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-semibold text-slate-700">Neuer Händler</span>
                        <button onClick={() => setIsAddingShop(false)} className="text-slate-400 hover:text-slate-600">
                          <X size={14} />
                        </button>
                      </div>
                      <input 
                        type="text" 
                        placeholder="Firmenname" 
                        value={newShopName}
                        onChange={(e) => setNewShopName(e.target.value)}
                        className="w-full p-2 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                      <input 
                        type="text" 
                        placeholder="Adresse (Straße, PLZ Ort)" 
                        value={newShopAddress}
                        onChange={(e) => setNewShopAddress(e.target.value)}
                        className="w-full p-2 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                      <input 
                        type="text" 
                        placeholder="Telefonnummer (optional)" 
                        value={newShopPhone}
                        onChange={(e) => setNewShopPhone(e.target.value)}
                        className="w-full p-2 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                      <input 
                        type="email" 
                        placeholder="E-Mail Adresse (optional)" 
                        value={newShopEmail}
                        onChange={(e) => setNewShopEmail(e.target.value)}
                        className="w-full p-2 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                      <button 
                        onClick={handleAddShop}
                        disabled={!newShopName.trim() || !newShopAddress.trim()}
                        className="w-full py-2 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-300 text-white text-sm font-medium rounded transition-colors"
                      >
                        Speichern & Auswählen
                      </button>
                    </div>
                  )}
                </div>

                {/* Formulartexte (Begründung, Name, Telefon) */}
                <div className="pt-2 border-t border-slate-100 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Begründung der Anforderung</label>
                    <textarea 
                      value={begruendung}
                      onChange={(e) => setBegruendung(e.target.value)}
                      placeholder="z.B. Das Material wird für..."
                      rows="2"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Empfänger / Ansprechpartner</label>
                    <input 
                      type="text" 
                      value={ansprechpartner}
                      onChange={(e) => setAnsprechpartner(e.target.value)}
                      placeholder="Name, Vorname"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Erreichbarkeit (Tel.)</label>
                    <input 
                      type="text" 
                      value={telefon}
                      onChange={(e) => setTelefon(e.target.value)}
                      placeholder="z.B. 90-2543-4061"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* Eingabe Formular Artikel */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
               <div className="bg-slate-100 p-4 border-b border-slate-200">
                <h2 className="font-semibold text-slate-700 flex items-center gap-2">
                  <Package size={18} /> Bauteil hinzufügen
                </h2>
              </div>
              <div className="p-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Artikelnummer / Art.-Nr.</label>
                      <input 
                        type="text"
                        ref={articleInputRef}
                        value={articleNr}
                        onChange={(e) => setArticleNr(e.target.value)}
                        placeholder="z.B. GOOBAY 11135"
                        className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        required
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Menge</label>
                      <input 
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Artikelbeschreibung</label>
                    <input 
                      type="text"
                      value={articleName}
                      onChange={(e) => setArticleName(e.target.value)}
                      placeholder="z.B. Einbaubuchse, Lötanschluss, Stift 2,1 mm"
                      className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      required
                    />
                  </div>

                  {/* Herstellerteilenummer jetzt unter der Beschreibung */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Herstellerteilenummer (optional)</label>
                    <input 
                      type="text"
                      value={mpn}
                      onChange={(e) => setMpn(e.target.value)}
                      placeholder="z.B. L7805CV"
                      className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Einzelpreis (Brutto in €)</label>
                    <input 
                      type="text"
                      value={priceGrossInput}
                      onChange={(e) => setPriceGrossInput(e.target.value)}
                      placeholder="z.B. 0,025"
                      className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      required
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="w-full py-2.5 px-4 bg-blue-700 hover:bg-blue-800 text-white font-medium rounded-lg transition-colors flex justify-center items-center gap-2"
                  >
                    <Plus size={18} /> Hinzufügen (ENTER)
                  </button>

                  {error && (
                    <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg flex gap-2 items-start border border-red-100">
                      <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>

          {/* Rechte Spalte: Dokumenten-Vorschau (A4 Optik) */}
          <div className="lg:col-span-8">
            
            {/* Toolbar für Export */}
            <div className="bg-white p-4 border border-slate-200 rounded-t-xl flex flex-col sm:flex-row justify-between items-center gap-4 print-hidden" data-html2canvas-ignore="true">
              <h2 className="font-semibold text-slate-700 flex items-center gap-2">
                <FileText size={18} /> Vorschau: Anforderungszettel ({items.length} Positionen)
              </h2>
              <div className="flex gap-2 w-full sm:w-auto">
                <button 
                  onClick={handleExportCSV}
                  disabled={items.length === 0}
                  className="flex-1 sm:flex-none justify-center flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                >
                  <FileSpreadsheet size={16} /> CSV
                </button>
                <button 
                  onClick={handleExportPDF}
                  disabled={isExporting || items.length === 0}
                  className="flex-1 sm:flex-none justify-center flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-400 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                >
                  {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                  {isExporting ? 'Export...' : 'PDF Export'}
                </button>
              </div>
            </div>

            {/* A4 Dokumenten-Container */}
            <div className="bg-slate-300 p-2 sm:p-8 rounded-b-xl border-x border-b border-slate-200 overflow-x-auto print:p-0 print:bg-white print:border-none">
              <div 
                id="pdf-content" 
                className="bg-white w-full max-w-[800px] mx-auto min-h-[1000px] shadow-lg print:shadow-none relative text-slate-900"
                style={{ padding: '40px 50px' }} // Simulation der A4 Seitenränder
              >
                
                {/* DOKUMENTEN-KOPF */}
                <div className="border border-black p-4 mb-8 flex justify-between items-start text-[13px] font-serif leading-snug">
                  <div>
                    <div className="mb-2">Einheit, Teileinheit,</div>
                    <div className="font-bold text-[15px]">AusbWkst Weener / {lagerort}</div>
                    <div className="mt-3">Lagerort: EFQ6-{lagerort.replace(' ', '')}</div>
                  </div>
                  <div>
                    <div className="flex gap-2"><span className="w-16">BAnfNr.:</span> <span className="w-32 border-b border-black inline-block"></span></div>
                    <div className="flex gap-2 mt-2"><span className="w-16">AuftrNr.:</span> <span className="w-32 border-b border-black inline-block"></span></div>
                  </div>
                </div>

                {/* TITEL */}
                <div className="text-center mb-6">
                  <h1 className="text-xl font-bold font-serif underline underline-offset-4 decoration-1">
                    Anforderungszettel „Dezentrale Beschaffung“
                  </h1>
                </div>

                {/* ADRESSE & DATUM */}
                <div className="flex justify-between items-start mb-8 text-[13px] font-serif">
                  <div className="flex flex-col">
                    <span className="mb-2 uppercase underline decoration-1 text-[11px]">Lieferant/ Adressat</span>
                    <span className="font-bold text-[15px]">{selectedShop.name}</span>
                    <span>{selectedShop.address.split(', ')[0]}</span>
                    <span>{selectedShop.address.split(', ')[1]}</span>
                    {selectedShop.phone && <span className="mt-1 text-[12px] text-slate-700">Tel.: {selectedShop.phone}</span>}
                    {selectedShop.email && <span className="text-[12px] text-slate-700">E-Mail: {selectedShop.email}</span>}
                  </div>
                  <div className="text-right leading-snug pt-6">
                    <div className="font-bold text-[14px]">Ausbildungswerkstatt Weener</div>
                    <div>Rostocker Str. 12</div>
                    <div>26826 Weener</div>
                    <div>{new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}</div>
                  </div>
                </div>

                <div className="font-serif font-bold text-lg mb-2">Bestellübersicht</div>

                {/* TABELLE */}
                <table className="w-full text-left text-[13px] font-sans border-collapse mb-8">
                  <thead>
                    <tr className="border-b-2 border-slate-800">
                      <th className="py-2 px-1 font-bold w-[35%]">Artikel</th>
                      <th className="py-2 px-1 font-bold text-center w-[10%]">Menge</th>
                      <th className="py-2 px-1 font-bold text-right w-[12%]">Netto (Stk.)</th>
                      <th className="py-2 px-1 font-bold text-right w-[13%]">Brutto (Stk.)</th>
                      <th className="py-2 px-1 font-bold text-right w-[15%]">Netto (Ges.)</th>
                      <th className="py-2 px-1 font-bold text-right w-[15%]">Brutto (Ges.)</th>
                      <th data-html2canvas-ignore="true" className="py-2 px-1 font-bold text-center w-8 print-hidden"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="py-8 text-center text-slate-400 italic">
                          Noch keine Artikel zur Anforderung hinzugefügt.
                        </td>
                      </tr>
                    ) : (
                      items.map((item) => (
                        <tr key={item.id} className="group">
                          <td className="py-3 px-1">
                            <div className="font-bold text-slate-900">{item.name}</div>
                            <div className="text-[11px] text-slate-600 mt-0.5">
                              <div><span className="font-bold text-slate-700">Art.-Nr:</span> {item.articleNr}</div>
                              {item.mpn && <div className="mt-0.5"><span className="font-bold text-slate-700">Herst.-Nr:</span> <span className="font-mono text-slate-800">{item.mpn}</span></div>}
                            </div>
                          </td>
                          <td className="py-3 px-1 text-center font-bold">
                            {item.quantity}x
                          </td>
                          <td className="py-3 px-1 text-right text-slate-700">
                            {formatCurrencyNettoStk(item.priceNet)}
                          </td>
                          <td className="py-3 px-1 text-right text-slate-700">
                            {formatCurrency(item.priceGross)}
                          </td>
                          <td className="py-3 px-1 text-right text-slate-800 font-medium">
                            {formatCurrencyTotal(item.priceNet * item.quantity)}
                          </td>
                          <td className="py-3 px-1 text-right">
                            <div className="font-bold text-slate-900">{formatCurrencyTotal(item.priceGross * item.quantity)}</div>
                          </td>
                          <td data-html2canvas-ignore="true" className="py-3 px-1 text-center print-hidden">
                            <button 
                              onClick={() => removeItem(item.id)}
                              className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                              title="Artikel entfernen"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  {items.length > 0 && (
                    <tfoot>
                      <tr className="border-t-2 border-slate-800 bg-slate-50">
                        <td colSpan="4" className="py-3 px-1"></td>
                        <td className="py-3 px-1 text-right">
                          <div className="text-[11px] text-slate-600 mb-0.5">Summe Netto:</div>
                          <div className="font-bold text-slate-800">{formatCurrencyTotal(totalNet)}</div>
                        </td>
                        <td className="py-3 px-1 text-right">
                          <div className="text-[11px] text-slate-600 mb-0.5">Summe Brutto:</div>
                          <div className="font-bold text-[15px] text-slate-900">{formatCurrencyTotal(totalGross)}</div>
                        </td>
                        <td data-html2canvas-ignore="true" className="print-hidden"></td>
                      </tr>
                    </tfoot>
                  )}
                </table>

                {/* DOKUMENTEN-FUSS (Unterschriften & Begründung) */}
                <div className="border border-black p-4 mt-12 text-[13px] font-serif space-y-4">
                  <div className="flex gap-2">
                    <span className="font-bold min-w-[200px] shrink-0">Begründung der Anforderung:</span> 
                    <span className="flex-1 border-b border-dotted border-black pb-0.5 break-words whitespace-pre-wrap">{begruendung}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold min-w-[200px] shrink-0">Empfänger / Ansprechpartner für das angeforderte Material (Name, Vorname):</span> 
                    <span className="flex-1 border-b border-dotted border-black pb-0.5 self-end break-words whitespace-pre-wrap">{ansprechpartner}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold min-w-[200px] shrink-0">Erreichbarkeit (Tel.):</span> 
                    <span className="flex-1 border-b border-dotted border-black pb-0.5 break-words whitespace-pre-wrap">{telefon}</span>
                  </div>
                </div>

                <div className="mt-20 grid grid-cols-3 gap-8 text-[11px] font-serif text-center">
                  <div className="border-t border-black pt-2">Angefordert durch TEFhr<br/>(Unterschrift, Datum)</div>
                  <div className="border-t border-black pt-2">Ausgegeben durch<br/>(Unterschrift, Datum)</div>
                  <div className="border-t border-black pt-2">Empfangen durch<br/>(Unterschrift, Datum)</div>
                </div>

                <div className="mt-8 text-[9px] text-slate-400 text-right font-sans">
                  Seite 1 von 1
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );

