import math
from typing import Dict, List, Optional
from .models import StationPreset, CurbsideBay, VirtualStop, Location

# Raw stations per city
RAW_CITIES_STATIONS = {
    "Hyderabad": [
        # Blue Line (Hitec City / Madhapur / Secunderabad / Nagole) - Listed in exact track sequence
        {"id": "raidurg", "name": "Raidurg Metro", "line": "Blue Line", "lat": 17.4399, "lng": 78.3772},
        {"id": "hitec_city", "name": "HITEC City Metro", "line": "Blue Line", "lat": 17.4475, "lng": 78.3792},
        {"id": "durgam_cheruvu", "name": "Durgam Cheruvu Metro", "line": "Blue Line", "lat": 17.4435, "lng": 78.3888},
        {"id": "madhapur", "name": "Madhapur Metro", "line": "Blue Line", "lat": 17.4402, "lng": 78.3995},
        {"id": "peddamma_gudi", "name": "Peddamma Gudi Metro", "line": "Blue Line", "lat": 17.4348, "lng": 78.4095},
        {"id": "jubilee_hills_checkpost", "name": "Jubilee Hills Check Post", "line": "Blue Line", "lat": 17.4310, "lng": 78.4168},
        {"id": "road_no_5", "name": "Road No 5 Jubilee Hills", "line": "Blue Line", "lat": 17.4315, "lng": 78.4235},
        {"id": "yusufguda", "name": "Yusufguda Metro", "line": "Blue Line", "lat": 17.4340, "lng": 78.4320},
        {"id": "madhura_nagar", "name": "Madhura Nagar Metro", "line": "Blue Line", "lat": 17.4355, "lng": 78.4390},
        {"id": "ameerpet", "name": "Ameerpet Metro Interchange", "line": "Blue / Red Line", "lat": 17.4375, "lng": 78.4483},
        {"id": "begumpet", "name": "Begumpet Metro", "line": "Blue Line", "lat": 17.4385, "lng": 78.4580},
        {"id": "prakash_nagar", "name": "Prakash Nagar Metro", "line": "Blue Line", "lat": 17.4420, "lng": 78.4680},
        {"id": "rasoolpura", "name": "Rasoolpura Metro", "line": "Blue Line", "lat": 17.4438, "lng": 78.4755},
        {"id": "paradise", "name": "Paradise Metro", "line": "Blue Line", "lat": 17.4418, "lng": 78.4870},
        {"id": "parade_ground", "name": "Parade Ground Interchange", "line": "Blue / Green Line", "lat": 17.4435, "lng": 78.4985},
        {"id": "secunderabad_east", "name": "Secunderabad East Metro", "line": "Blue Line", "lat": 17.4350, "lng": 78.5040},
        {"id": "mettuguda", "name": "Mettuguda Metro", "line": "Blue Line", "lat": 17.4320, "lng": 78.5175},
        {"id": "tarnaka", "name": "Tarnaka Metro", "line": "Blue Line", "lat": 17.4285, "lng": 78.5310},
        {"id": "habsiguda", "name": "Habsiguda Metro", "line": "Blue Line", "lat": 17.4175, "lng": 78.5430},
        {"id": "ngri", "name": "NGRI Metro", "line": "Blue Line", "lat": 17.4120, "lng": 78.5525},
        {"id": "stadium", "name": "Stadium Metro", "line": "Blue Line", "lat": 17.4065, "lng": 78.5570},
        {"id": "uppal", "name": "Uppal Metro", "line": "Blue Line", "lat": 17.4020, "lng": 78.5605},
        {"id": "nagole", "name": "Nagole Metro", "line": "Blue Line", "lat": 17.3885, "lng": 78.5645},

        # Red Line (Miyapur to LB Nagar) - Listed in exact track sequence
        {"id": "miyapur", "name": "Miyapur Metro", "line": "Red Line", "lat": 17.4965, "lng": 78.3610},
        {"id": "jntu_college", "name": "JNTU College Metro", "line": "Red Line", "lat": 17.4980, "lng": 78.3910},
        {"id": "kphb_colony", "name": "KPHB Colony Metro", "line": "Red Line", "lat": 17.4925, "lng": 78.4015},
        {"id": "kukatpally", "name": "Kukatpally Metro", "line": "Red Line", "lat": 17.4845, "lng": 78.4140},
        {"id": "balanagar", "name": "Balanagar Metro", "line": "Red Line", "lat": 17.4760, "lng": 78.4280},
        {"id": "moosapet", "name": "Moosapet Metro", "line": "Red Line", "lat": 17.4695, "lng": 78.4350},
        {"id": "bharat_nagar", "name": "Bharat Nagar Metro", "line": "Red Line", "lat": 17.4635, "lng": 78.4410},
        {"id": "erragadda", "name": "Erragadda Metro", "line": "Red Line", "lat": 17.4560, "lng": 78.4435},
        {"id": "esi_hospital", "name": "ESI Hospital Metro", "line": "Red Line", "lat": 17.4505, "lng": 78.4455},
        {"id": "sr_nagar", "name": "SR Nagar Metro", "line": "Red Line", "lat": 17.4425, "lng": 78.4470},
        {"id": "punjagutta", "name": "Punjagutta Metro", "line": "Red Line", "lat": 17.4275, "lng": 78.4520},
        {"id": "irrum_manzil", "name": "Irrum Manzil Metro", "line": "Red Line", "lat": 17.4205, "lng": 78.4550},
        {"id": "khairatabad", "name": "Khairatabad Metro", "line": "Red Line", "lat": 17.4125, "lng": 78.4605},
        {"id": "lakdi_ka_pul", "name": "Lakdi-ka-pul Metro", "line": "Red Line", "lat": 17.4045, "lng": 78.4655},
        {"id": "assembly", "name": "Assembly Metro", "line": "Red Line", "lat": 17.3995, "lng": 78.4695},
        {"id": "nampally", "name": "Nampally Metro", "line": "Red Line", "lat": 17.3920, "lng": 78.4715},
        {"id": "gandhi_bhavan", "name": "Gandhi Bhavan Metro", "line": "Red Line", "lat": 17.3850, "lng": 78.4735},
        {"id": "omc", "name": "Osmania Medical College", "line": "Red Line", "lat": 17.3805, "lng": 78.4780},
        {"id": "mgbs", "name": "MGBS Interchange", "line": "Red / Green Line", "lat": 17.3780, "lng": 78.4835},
        {"id": "malakpet", "name": "Malakpet Metro", "line": "Red Line", "lat": 17.3735, "lng": 78.4940},
        {"id": "dilsukhnagar", "name": "Dilsukhnagar Metro", "line": "Red Line", "lat": 17.3685, "lng": 78.5245},
        {"id": "chaitanyapuri", "name": "Chaitanyapuri Metro", "line": "Red Line", "lat": 17.3645, "lng": 78.5370},
        {"id": "lb_nagar", "name": "LB Nagar Metro", "line": "Red Line", "lat": 17.3505, "lng": 78.5525},

        # Green Line (JBS Parade Ground to MGBS) - Listed in exact track sequence
        {"id": "jbs_parade_ground", "name": "JBS Parade Ground", "line": "Green Line", "lat": 17.4470, "lng": 78.4975},
        {"id": "secunderabad_west", "name": "Secunderabad West Metro", "line": "Green Line", "lat": 17.4385, "lng": 78.5005},
        {"id": "gandhi_hospital", "name": "Gandhi Hospital Metro", "line": "Green Line", "lat": 17.4241, "lng": 78.5034},
        {"id": "musheerabad", "name": "Musheerabad Metro", "line": "Green Line", "lat": 17.4190, "lng": 78.5015},
        {"id": "rtc_x_roads", "name": "RTC X Roads Metro", "line": "Green Line", "lat": 17.4085, "lng": 78.4985},
        {"id": "chikkadpally", "name": "Chikkadpally Metro", "line": "Green Line", "lat": 17.4005, "lng": 78.4965},
        {"id": "narayanguda", "name": "Narayanguda Metro", "line": "Green Line", "lat": 17.3935, "lng": 78.4925},
        {"id": "sultan_bazar", "name": "Sultan Bazar Metro", "line": "Green Line", "lat": 17.3860, "lng": 78.4865},
    ],
    "Bengaluru": [
        # Purple Line (Whitefield to Challaghatta)
        {"id": "whitefield", "name": "Whitefield (Kadugodi) Metro", "line": "Purple Line", "lat": 12.9780, "lng": 77.7570},
        {"id": "hopefarm", "name": "Hopefarm Channasandra Metro", "line": "Purple Line", "lat": 12.9840, "lng": 77.7490},
        {"id": "pattandur_agrahara", "name": "Pattandur Agrahara (ITPB)", "line": "Purple Line", "lat": 12.9865, "lng": 77.7345},
        {"id": "sri_sathya_sai", "name": "Sri Sathya Sai Hospital Metro", "line": "Purple Line", "lat": 12.9815, "lng": 77.7250},
        {"id": "kundalahalli", "name": "Kundalahalli Metro", "line": "Purple Line", "lat": 12.9770, "lng": 77.7125},
        {"id": "seetharampalya", "name": "Seetharampalya Metro", "line": "Purple Line", "lat": 12.9805, "lng": 77.7020},
        {"id": "hoodi", "name": "Hoodi Metro", "line": "Purple Line", "lat": 12.9895, "lng": 77.6985},
        {"id": "garudacharpalya", "name": "Garudacharpalya Metro", "line": "Purple Line", "lat": 12.9935, "lng": 77.6880},
        {"id": "kr_pura", "name": "KR Pura Metro Interchange", "line": "Purple / Blue Line", "lat": 12.9985, "lng": 77.6745},
        {"id": "benniganahalli", "name": "Benniganahalli (Tin Factory)", "line": "Purple Line", "lat": 12.9975, "lng": 77.6620},
        {"id": "baiyappanahalli", "name": "Baiyappanahalli Metro", "line": "Purple Line", "lat": 12.9910, "lng": 77.6525},
        {"id": "swami_vivekananda", "name": "Swami Vivekananda Road Metro", "line": "Purple Line", "lat": 12.9860, "lng": 77.6445},
        {"id": "indiranagar", "name": "Indiranagar Metro", "line": "Purple Line", "lat": 12.9784, "lng": 77.6408},
        {"id": "halasuru", "name": "Halasuru Metro", "line": "Purple Line", "lat": 12.9760, "lng": 77.6270},
        {"id": "trinity", "name": "Trinity Metro", "line": "Purple Line", "lat": 12.9735, "lng": 77.6170},
        {"id": "mg_road", "name": "MG Road Interchange", "line": "Purple / Pink Line", "lat": 12.9755, "lng": 77.6070},
        {"id": "cubbon_park", "name": "Cubbon Park Metro", "line": "Purple Line", "lat": 12.9810, "lng": 77.5995},
        {"id": "vidhana_soudha", "name": "Vidhana Soudha Metro", "line": "Purple Line", "lat": 12.9795, "lng": 77.5925},
        {"id": "visvesvaraya", "name": "Sir M. Visvesvaraya Metro", "line": "Purple Line", "lat": 12.9740, "lng": 77.5845},
        {"id": "majestic_kempegowda", "name": "Nadaprabhu Kempegowda (Majestic)", "line": "Purple / Green Line", "lat": 12.9757, "lng": 77.5728},
        {"id": "city_railway_station", "name": "Krantivira Sangolli Rayanna Metro", "line": "Purple Line", "lat": 12.9775, "lng": 77.5670},
        {"id": "magadi_road", "name": "Magadi Road Metro", "line": "Purple Line", "lat": 12.9755, "lng": 77.5550},
        {"id": "hosahalli", "name": "Hosahalli Metro", "line": "Purple Line", "lat": 12.9745, "lng": 77.5450},
        {"id": "vijayanagar", "name": "Vijayanagar Metro", "line": "Purple Line", "lat": 12.9695, "lng": 77.5375},
        {"id": "attiguppe", "name": "Attiguppe Metro", "line": "Purple Line", "lat": 12.9620, "lng": 77.5335},
        {"id": "deepanjali_nagar", "name": "Deepanjali Nagar Metro", "line": "Purple Line", "lat": 12.9525, "lng": 77.5365},
        {"id": "mysuru_road", "name": "Mysuru Road Metro", "line": "Purple Line", "lat": 12.9465, "lng": 77.5305},
        {"id": "nayandahalli", "name": "Nayandahalli Metro", "line": "Purple Line", "lat": 12.9410, "lng": 77.5215},
        {"id": "rajarajeshwari_nagar", "name": "Rajarajeshwari Nagar Metro", "line": "Purple Line", "lat": 12.9305, "lng": 77.5140},
        {"id": "jnanabharathi", "name": "Jnanabharathi (Bangalore Univ)", "line": "Purple Line", "lat": 12.9230, "lng": 77.5020},
        {"id": "pattanagere", "name": "Pattanagere Metro", "line": "Purple Line", "lat": 12.9190, "lng": 77.4940},
        {"id": "kengeri", "name": "Kengeri Bus Terminal Metro", "line": "Purple Line", "lat": 12.9125, "lng": 77.4835},
        {"id": "challaghatta", "name": "Challaghatta Metro", "line": "Purple Line", "lat": 12.9055, "lng": 77.4680},

        # Green Line (Nagasandra to Silk Institute)
        {"id": "nagasandra", "name": "Nagasandra Metro", "line": "Green Line", "lat": 13.0475, "lng": 77.4995},
        {"id": "peenya", "name": "Peenya Metro", "line": "Green Line", "lat": 13.0325, "lng": 77.5255},
        {"id": "goraguntepalya", "name": "Goraguntepalya Metro", "line": "Green Line", "lat": 13.0285, "lng": 77.5410},
        {"id": "yeshwantpur", "name": "Yeshwantpur Metro", "line": "Green Line", "lat": 13.0235, "lng": 77.5505},
        {"id": "sandal_soap_factory", "name": "Sandal Soap Factory Metro", "line": "Green Line", "lat": 13.0145, "lng": 77.5535},
        {"id": "mahalakshmi", "name": "Mahalakshmi Metro", "line": "Green Line", "lat": 13.0075, "lng": 77.5490},
        {"id": "rajajinagar", "name": "Rajajinagar Metro", "line": "Green Line", "lat": 12.9985, "lng": 77.5555},
        {"id": "kuvempu_road", "name": "Kuvempu Road Metro", "line": "Green Line", "lat": 12.9935, "lng": 77.5585},
        {"id": "srirampura", "name": "Srirampura Metro", "line": "Green Line", "lat": 12.9905, "lng": 77.5645},
        {"id": "sampige_road", "name": "Mantri Square Sampige Road", "line": "Green Line", "lat": 12.9915, "lng": 77.5705},
        {"id": "chickpete", "name": "Chickpete Metro", "line": "Green Line", "lat": 12.9675, "lng": 77.5750},
        {"id": "kr_market", "name": "Krishna Rajendra Market Metro", "line": "Green Line", "lat": 12.9610, "lng": 77.5745},
        {"id": "national_college", "name": "National College Basavanagudi", "line": "Green Line", "lat": 12.9505, "lng": 77.5735},
        {"id": "lalbagh", "name": "Lalbagh Botanical Garden Metro", "line": "Green Line", "lat": 12.9460, "lng": 77.5800},
        {"id": "south_end_circle", "name": "South End Circle Metro", "line": "Green Line", "lat": 12.9375, "lng": 77.5805},
        {"id": "jayanagar", "name": "Jayanagar 4th Block Metro", "line": "Green Line", "lat": 12.9295, "lng": 77.5800},
        {"id": "rv_road", "name": "Rashtreeya Vidyalaya Road Metro", "line": "Green / Yellow Line", "lat": 12.9215, "lng": 77.5800},
        {"id": "banashankari", "name": "Banashankari TTMC Metro", "line": "Green Line", "lat": 12.9155, "lng": 77.5735},
        {"id": "jp_nagar", "name": "Jaya Prakash Nagar Metro", "line": "Green Line", "lat": 12.9075, "lng": 77.5735},
        {"id": "yelachenahalli", "name": "Yelachenahalli Metro", "line": "Green Line", "lat": 12.8955, "lng": 77.5700},
        {"id": "konanakunte_cross", "name": "Konanakunte Cross Metro", "line": "Green Line", "lat": 12.8845, "lng": 77.5645},
        {"id": "silk_institute", "name": "Silk Institute Metro", "line": "Green Line", "lat": 12.8625, "lng": 77.5255},

        # Yellow Line (Central Silk Board to Electronic City)
        {"id": "silk_board", "name": "Central Silk Board Metro", "line": "Yellow / Blue Line", "lat": 12.9175, "lng": 77.6235},
        {"id": "btm_layout", "name": "BTM Layout Metro", "line": "Yellow Line", "lat": 12.9160, "lng": 77.6105},
        {"id": "electronic_city_1", "name": "Electronic City Phase 1 Metro", "line": "Yellow Line", "lat": 12.8450, "lng": 77.6630},
        {"id": "electronic_city_2", "name": "Electronic City Phase 2 Metro", "line": "Yellow Line", "lat": 12.8390, "lng": 77.6780},
    ],
    "Delhi NCR": [
        # Yellow Line (Kashmere Gate to Millennium City Centre)
        {"id": "kashmere_gate", "name": "Kashmere Gate Multi-Modal Hub", "line": "Yellow Line", "lat": 28.6675, "lng": 77.2285},
        {"id": "chandni_chowk", "name": "Chandni Chowk Old Delhi Metro", "line": "Yellow Line", "lat": 28.6575, "lng": 77.2305},
        {"id": "chawri_bazar", "name": "Chawri Bazar Metro", "line": "Yellow Line", "lat": 28.6495, "lng": 77.2260},
        {"id": "new_delhi_railway", "name": "New Delhi Railway Metro", "line": "Yellow Line", "lat": 28.6430, "lng": 77.2225},
        {"id": "rajiv_chowk", "name": "Rajiv Chowk (Connaught Place)", "line": "Yellow Line", "lat": 28.6328, "lng": 77.2197},
        {"id": "patel_chowk", "name": "Patel Chowk Metro", "line": "Yellow Line", "lat": 28.6230, "lng": 77.2140},
        {"id": "central_secretariat", "name": "Central Secretariat Interchange", "line": "Yellow Line", "lat": 28.6145, "lng": 77.2120},
        {"id": "udyog_bhawan", "name": "Udyog Bhawan Metro", "line": "Yellow Line", "lat": 28.6110, "lng": 77.2125},
        {"id": "lok_kalyan_marg", "name": "Lok Kalyan Marg Metro", "line": "Yellow Line", "lat": 28.5985, "lng": 77.2115},
        {"id": "jor_bagh", "name": "Jor Bagh Metro", "line": "Yellow Line", "lat": 28.5880, "lng": 77.2120},
        {"id": "dilli_haat_ina", "name": "Dilli Haat INA Interchange", "line": "Yellow Line", "lat": 28.5745, "lng": 77.2095},
        {"id": "aiims", "name": "AIIMS Healthcare Metro", "line": "Yellow Line", "lat": 28.5685, "lng": 77.2075},
        {"id": "green_park", "name": "Green Park Metro", "line": "Yellow Line", "lat": 28.5595, "lng": 77.2065},
        {"id": "hauz_khas", "name": "Hauz Khas Interchange", "line": "Yellow Line", "lat": 28.5435, "lng": 77.2060},
        {"id": "malviya_nagar", "name": "Malviya Nagar Metro", "line": "Yellow Line", "lat": 28.5285, "lng": 77.2060},
        {"id": "saket", "name": "Saket District Centre Metro", "line": "Yellow Line", "lat": 28.5205, "lng": 77.2015},
        {"id": "qutab_minar", "name": "Qutab Minar Heritage Metro", "line": "Yellow Line", "lat": 28.5130, "lng": 77.1860},
        {"id": "chhatarpur", "name": "Chhatarpur Temple Metro", "line": "Yellow Line", "lat": 28.5065, "lng": 77.1745},
        {"id": "sultanpur", "name": "Sultanpur Metro", "line": "Yellow Line", "lat": 28.4985, "lng": 77.1615},
        {"id": "arjan_garh", "name": "Arjan Garh Border Metro", "line": "Yellow Line", "lat": 28.4810, "lng": 77.1265},
        {"id": "guru_dronacharya", "name": "Guru Dronacharya Metro", "line": "Yellow Line", "lat": 28.4820, "lng": 77.1030},
        {"id": "sikanderpur", "name": "Sikanderpur Interchange", "line": "Yellow Line", "lat": 28.4825, "lng": 77.0930},
        {"id": "mg_road_gurugram", "name": "MG Road Gurugram Mall Mile", "line": "Yellow Line", "lat": 28.4795, "lng": 77.0805},
        {"id": "iffco_chowk", "name": "IFFCO Chowk Metro", "line": "Yellow Line", "lat": 28.4720, "lng": 77.0725},
        {"id": "millennium_city_centre", "name": "Millennium City Centre (HUDA)", "line": "Yellow Line", "lat": 28.4595, "lng": 77.0725},
        {"id": "cyber_city", "name": "DLF Cyber City Rapid Metro", "line": "Yellow Line", "lat": 28.4950, "lng": 77.0895},

        # Blue Line (Dwarka to Noida)
        {"id": "dwarka_sector_21", "name": "Dwarka Sector 21 Interchange", "line": "Blue Line", "lat": 28.5520, "lng": 77.0585},
        {"id": "dwarka_mor", "name": "Dwarka Mor Metro", "line": "Blue Line", "lat": 28.6195, "lng": 77.0335},
        {"id": "janakpuri_west", "name": "Janakpuri West Interchange", "line": "Blue Line", "lat": 28.6295, "lng": 77.0775},
        {"id": "rajouri_garden", "name": "Rajouri Garden Interchange", "line": "Blue Line", "lat": 28.6490, "lng": 77.1225},
        {"id": "karol_bagh", "name": "Karol Bagh Market Metro", "line": "Blue Line", "lat": 28.6445, "lng": 77.1905},
        {"id": "barakhamba_road", "name": "Barakhamba Road Corporate Hub", "line": "Blue Line", "lat": 28.6305, "lng": 77.2275},
        {"id": "mandi_house", "name": "Mandi House Cultural Hub", "line": "Blue Line", "lat": 28.6255, "lng": 77.2345},
        {"id": "supreme_court", "name": "Supreme Court (Pragati Maidan)", "line": "Blue Line", "lat": 28.6185, "lng": 77.2450},
        {"id": "indraprastha", "name": "Indraprastha Metro", "line": "Blue Line", "lat": 28.6180, "lng": 77.2530},
        {"id": "akshardham", "name": "Akshardham Temple Metro", "line": "Blue Line", "lat": 28.6185, "lng": 77.2790},
        {"id": "mayur_vihar_1", "name": "Mayur Vihar Phase 1 Interchange", "line": "Blue Line", "lat": 28.6045, "lng": 77.2940},
        {"id": "noida_sector_18", "name": "Noida Sector 18 (Atta Market)", "line": "Blue Line", "lat": 28.5705, "lng": 77.3260},
        {"id": "botanical_garden", "name": "Botanical Garden Interchange", "line": "Blue Line", "lat": 28.5645, "lng": 77.3345},
        {"id": "noida_city_centre", "name": "Noida City Centre (Wave)", "line": "Blue Line", "lat": 28.5745, "lng": 77.3560},
        {"id": "noida_electronic_city", "name": "Noida Electronic City Metro", "line": "Blue Line", "lat": 28.6280, "lng": 77.3745},
        {"id": "lajpat_nagar", "name": "Lajpat Nagar Central Market", "line": "Blue Line", "lat": 28.5705, "lng": 77.2375},
        {"id": "nehru_place", "name": "Nehru Place Tech Market Metro", "line": "Blue Line", "lat": 28.5515, "lng": 77.2515},
        {"id": "kalkaji_mandir", "name": "Kalkaji Mandir Interchange", "line": "Blue Line", "lat": 28.5495, "lng": 77.2580},
    ],
    "Mumbai": [
        {"id": "versova", "name": "Versova Beach Metro", "line": "Line 1 (Blue)", "lat": 19.1315, "lng": 72.8185},
        {"id": "dn_nagar", "name": "D.N. Nagar Interchange", "line": "Line 1 (Blue)", "lat": 19.1305, "lng": 72.8275},
        {"id": "azad_nagar", "name": "Azad Nagar Metro", "line": "Line 1 (Blue)", "lat": 19.1285, "lng": 72.8365},
        {"id": "andheri_metro", "name": "Andheri Railway Interchange", "line": "Line 1 (Blue)", "lat": 19.1195, "lng": 72.8465},
        {"id": "western_express_highway", "name": "Western Express Highway (WEH)", "line": "Line 1 (Blue)", "lat": 19.1165, "lng": 72.8565},
        {"id": "chakala", "name": "Chakala (J.B. Nagar) Metro", "line": "Line 1 (Blue)", "lat": 19.1115, "lng": 72.8665},
        {"id": "airport_road_mumbai", "name": "Airport Road Terminal Metro", "line": "Line 1 (Blue)", "lat": 19.1085, "lng": 72.8765},
        {"id": "marol_naka", "name": "Marol Naka Interchange", "line": "Line 1 (Blue)", "lat": 19.1065, "lng": 72.8865},
        {"id": "saki_naka", "name": "Saki Naka Junction Metro", "line": "Line 1 (Blue)", "lat": 19.1030, "lng": 72.8905},
        {"id": "asalpha", "name": "Asalpha Metro", "line": "Line 1 (Blue)", "lat": 19.0965, "lng": 72.8995},
        {"id": "jagruti_nagar", "name": "Jagruti Nagar Metro", "line": "Line 1 (Blue)", "lat": 19.0915, "lng": 72.9035},
        {"id": "ghatkopar_metro", "name": "Ghatkopar Railway Interchange", "line": "Line 1 (Blue)", "lat": 19.0865, "lng": 72.9085},

        # Line 7 (Red)
        {"id": "gundavali", "name": "Gundavali Metro Hub", "line": "Line 7 (Red)", "lat": 19.1160, "lng": 72.8570},
        {"id": "goregaon_east", "name": "Goregaon East (Aarey Road)", "line": "Line 7 (Red)", "lat": 19.1645, "lng": 72.8595},
        {"id": "dindoshi", "name": "Dindoshi Film City Metro", "line": "Line 7 (Red)", "lat": 19.1765, "lng": 72.8615},
        {"id": "borivali_east", "name": "Borivali East National Park", "line": "Line 7 (Red)", "lat": 19.2295, "lng": 72.8610},
        {"id": "dahisar_east", "name": "Dahisar East Interchange", "line": "Line 7 (Red)", "lat": 19.2565, "lng": 72.8640},

        # Line 3 (Aqua)
        {"id": "cuffe_parade", "name": "Cuffe Parade South Terminal", "line": "Line 3 (Aqua)", "lat": 18.9135, "lng": 72.8220},
        {"id": "dadar_metro", "name": "Dadar Central Concourse", "line": "Line 3 (Aqua)", "lat": 19.0195, "lng": 72.8435},
        {"id": "bkc_metro", "name": "Bandra Kurla Complex (BKC)", "line": "Line 3 (Aqua)", "lat": 19.0665, "lng": 72.8685},
    ],
    "Chennai": [
        {"id": "chennai_airport", "name": "Chennai International Airport", "line": "Blue Line", "lat": 12.9805, "lng": 80.1635},
        {"id": "alandur", "name": "Alandur Junction Interchange", "line": "Blue Line", "lat": 13.0045, "lng": 80.2015},
        {"id": "guindy_metro", "name": "Guindy Industrial Estate", "line": "Blue Line", "lat": 13.0095, "lng": 80.2135},
        {"id": "saidapet", "name": "Saidapet Bridge Metro", "line": "Blue Line", "lat": 13.0235, "lng": 80.2255},
        {"id": "nandanam", "name": "Nandanam Junction Metro", "line": "Blue Line", "lat": 13.0315, "lng": 80.2375},
        {"id": "teynampet", "name": "Teynampet High Road Metro", "line": "Blue Line", "lat": 13.0410, "lng": 80.2465},
        {"id": "thousand_lights", "name": "Thousand Lights Anna Salai", "line": "Blue Line", "lat": 13.0585, "lng": 80.2545},
        {"id": "chennai_central", "name": "Puratchi Thalaivar MGR Central", "line": "Blue Line", "lat": 13.0825, "lng": 80.2755},
        {"id": "egmore_metro", "name": "Chennai Egmore Railway Metro", "line": "Green Line", "lat": 13.0785, "lng": 80.2610},
        {"id": "nehru_park", "name": "Nehru Park Metro", "line": "Green Line", "lat": 13.0795, "lng": 80.2505},
        {"id": "kilpauk", "name": "Kilpauk Medical College Metro", "line": "Green Line", "lat": 13.0780, "lng": 80.2415},
        {"id": "shenoy_nagar", "name": "Shenoy Nagar Park Metro", "line": "Green Line", "lat": 13.0775, "lng": 80.2285},
        {"id": "anna_nagar_tower", "name": "Anna Nagar Tower Metro", "line": "Green Line", "lat": 13.0850, "lng": 80.2115},
        {"id": "thirumangalam", "name": "Thirumangalam Metro", "line": "Green Line", "lat": 13.0855, "lng": 80.1985},
        {"id": "koyambedu_metro", "name": "Koyambedu CMBT Terminal", "line": "Green Line", "lat": 13.0725, "lng": 80.1945},
        {"id": "vadapalani", "name": "Vadapalani Murugan Temple", "line": "Green Line", "lat": 13.0515, "lng": 80.2110},
        {"id": "ashok_nagar", "name": "Ashok Nagar Metro", "line": "Green Line", "lat": 13.0365, "lng": 80.2115},
    ],
    "Kolkata": [
        {"id": "howrah_maidan", "name": "Howrah Maidan Metro", "line": "Green Line", "lat": 22.5855, "lng": 88.3305},
        {"id": "howrah_railway_metro", "name": "Howrah Station (Underwater)", "line": "Green Line", "lat": 22.5835, "lng": 88.3425},
        {"id": "mahakaran", "name": "Mahakaran (BBD Bagh) Metro", "line": "Green Line", "lat": 22.5730, "lng": 88.3495},
        {"id": "esplanade", "name": "Esplanade Interchange Hub", "line": "Green Line", "lat": 22.5645, "lng": 88.3515},
        {"id": "sealdah_metro", "name": "Sealdah Railway Interchange", "line": "Green Line", "lat": 22.5675, "lng": 88.3715},
        {"id": "phoolbagan", "name": "Phoolbagan Metro", "line": "Green Line", "lat": 22.5715, "lng": 88.3885},
        {"id": "salt_lake_stadium", "name": "Salt Lake Stadium (Yuva Bharati)", "line": "Green Line", "lat": 22.5710, "lng": 88.4035},
        {"id": "city_centre_saltlake", "name": "City Centre Salt Lake Metro", "line": "Green Line", "lat": 22.5875, "lng": 88.4095},
        {"id": "karunamoyee", "name": "Karunamoyee Bus Concourse", "line": "Green Line", "lat": 22.5865, "lng": 88.4195},
        {"id": "sector_v_saltlake", "name": "Salt Lake Sector V IT Hub", "line": "Green Line", "lat": 22.5805, "lng": 88.4325},
        {"id": "dakshineswar", "name": "Dakshineswar Temple Concourse", "line": "Blue Line", "lat": 22.6545, "lng": 88.3585},
        {"id": "dum_dum", "name": "Dum Dum Railway Interchange", "line": "Blue Line", "lat": 22.6215, "lng": 88.3930},
        {"id": "park_street", "name": "Park Street Commercial Metro", "line": "Blue Line", "lat": 22.5515, "lng": 88.3510},
        {"id": "maidan", "name": "Maidan Brigade Parade Metro", "line": "Blue Line", "lat": 22.5445, "lng": 88.3495},
        {"id": "kalighat", "name": "Kalighat Temple Metro", "line": "Blue Line", "lat": 22.5185, "lng": 88.3455},
    ]
}

# Real-World Metro Track Lines per City
METRO_LINES_REGISTRY = {
    "Hyderabad": [
        {
            "id": "hyd_blue",
            "name": "Blue Line (Raidurg ➔ Nagole)",
            "color": "#3B82F6", # Vibrant Blue
            "stations_count": 23,
            "track_coords": [
                [17.4399, 78.3772], [17.4475, 78.3792], [17.4435, 78.3888], [17.4402, 78.3995],
                [17.4348, 78.4095], [17.4310, 78.4168], [17.4315, 78.4235], [17.4340, 78.4320],
                [17.4355, 78.4390], [17.4375, 78.4483], [17.4385, 78.4580], [17.4420, 78.4680],
                [17.4438, 78.4755], [17.4418, 78.4870], [17.4435, 78.4985], [17.4350, 78.5040],
                [17.4320, 78.5175], [17.4285, 78.5310], [17.4175, 78.5430], [17.4120, 78.5525],
                [17.4065, 78.5570], [17.4020, 78.5605], [17.3885, 78.5645]
            ]
        },
        {
            "id": "hyd_red",
            "name": "Red Line (Miyapur ➔ LB Nagar)",
            "color": "#EF4444", # Vibrant Red
            "stations_count": 23,
            "track_coords": [
                [17.4965, 78.3610], [17.4980, 78.3910], [17.4925, 78.4015], [17.4845, 78.4140],
                [17.4760, 78.4280], [17.4695, 78.4350], [17.4635, 78.4410], [17.4560, 78.4435],
                [17.4505, 78.4455], [17.4425, 78.4470], [17.4375, 78.4483], [17.4275, 78.4520],
                [17.4205, 78.4550], [17.4125, 78.4605], [17.4045, 78.4655], [17.3995, 78.4695],
                [17.3920, 78.4715], [17.3850, 78.4735], [17.3805, 78.4780], [17.3780, 78.4835],
                [17.3735, 78.4940], [17.3685, 78.5245], [17.3645, 78.5370], [17.3505, 78.5525]
            ]
        },
        {
            "id": "hyd_green",
            "name": "Green Line (JBS ➔ MGBS)",
            "color": "#10B981", # Vibrant Emerald
            "stations_count": 8,
            "track_coords": [
                [17.4470, 78.4975], [17.4385, 78.5005], [17.4241, 78.5034], [17.4190, 78.5015],
                [17.4085, 78.4985], [17.4005, 78.4965], [17.3935, 78.4925], [17.3860, 78.4865],
                [17.3780, 78.4835]
            ]
        }
    ],
    "Bengaluru": [
        {
            "id": "blr_purple",
            "name": "Purple Line (Challaghatta ➔ Whitefield)",
            "color": "#A855F7", # Royal Purple
            "stations_count": 33,
            "track_coords": [
                [12.9055, 77.4680], [12.9125, 77.4835], [12.9190, 77.4940], [12.9230, 77.5020],
                [12.9305, 77.5140], [12.9410, 77.5215], [12.9465, 77.5305], [12.9525, 77.5365],
                [12.9620, 77.5335], [12.9695, 77.5375], [12.9745, 77.5450], [12.9755, 77.5550],
                [12.9775, 77.5670], [12.9757, 77.5728], [12.9740, 77.5845], [12.9795, 77.5925],
                [12.9810, 77.5995], [12.9755, 77.6070], [12.9735, 77.6170], [12.9760, 77.6270],
                [12.9784, 77.6408], [12.9860, 77.6445], [12.9910, 77.6525], [12.9975, 77.6620],
                [12.9985, 77.6745], [12.9935, 77.6880], [12.9895, 77.6985], [12.9805, 77.7020],
                [12.9770, 77.7125], [12.9815, 77.7250], [12.9865, 77.7345], [12.9840, 77.7490],
                [12.9780, 77.7570]
            ]
        },
        {
            "id": "blr_green",
            "name": "Green Line (Nagasandra ➔ Silk Institute)",
            "color": "#10B981",
            "stations_count": 22,
            "track_coords": [
                [13.0475, 77.4995], [13.0325, 77.5255], [13.0285, 77.5410], [13.0235, 77.5505],
                [13.0145, 77.5535], [13.0075, 77.5490], [12.9985, 77.5555], [12.9935, 77.5585],
                [12.9905, 77.5645], [12.9915, 77.5705], [12.9757, 77.5728], [12.9675, 77.5750],
                [12.9610, 77.5745], [12.9505, 77.5735], [12.9460, 77.5800], [12.9375, 77.5805],
                [12.9295, 77.5800], [12.9215, 77.5800], [12.9155, 77.5735], [12.9075, 77.5735],
                [12.8955, 77.5700], [12.8845, 77.5645], [12.8625, 77.5255]
            ]
        },
        {
            "id": "blr_yellow",
            "name": "Yellow Line (Silk Board ➔ Electronic City)",
            "color": "#F59E0B",
            "stations_count": 4,
            "track_coords": [
                [12.9175, 77.6235], [12.9160, 77.6105], [12.8450, 77.6630], [12.8390, 77.6780]
            ]
        }
    ],
    "Delhi NCR": [
        {
            "id": "del_yellow",
            "name": "Yellow Line (Kashmere Gate ➔ Gurugram)",
            "color": "#FACC15", # Bright Yellow
            "stations_count": 25,
            "track_coords": [
                [28.6675, 77.2285], [28.6575, 77.2305], [28.6495, 77.2260], [28.6430, 77.2225],
                [28.6328, 77.2197], [28.6230, 77.2140], [28.6145, 77.2120], [28.6110, 77.2125],
                [28.5985, 77.2115], [28.5880, 77.2120], [28.5745, 77.2095], [28.5685, 77.2075],
                [28.5595, 77.2065], [28.5435, 77.2060], [28.5285, 77.2060], [28.5205, 77.2015],
                [28.5130, 77.1860], [28.5065, 77.1745], [28.4985, 77.1615], [28.4810, 77.1265],
                [28.4820, 77.1030], [28.4825, 77.0930], [28.4795, 77.0805], [28.4720, 77.0725],
                [28.4595, 77.0725]
            ]
        },
        {
            "id": "del_blue",
            "name": "Blue Line (Dwarka ➔ Noida Electronic City)",
            "color": "#3B82F6",
            "stations_count": 15,
            "track_coords": [
                [28.5520, 77.0585], [28.6195, 77.0335], [28.6295, 77.0775], [28.6490, 77.1225],
                [28.6445, 77.1905], [28.6328, 77.2197], [28.6305, 77.2275], [28.6255, 77.2345],
                [28.6185, 77.2450], [28.6180, 77.2530], [28.6185, 77.2790], [28.6045, 77.2940],
                [28.5705, 77.3260], [28.5645, 77.3345], [28.5745, 77.3560], [28.6280, 77.3745]
            ]
        }
    ],
    "Mumbai": [
        {
            "id": "mum_line1",
            "name": "Line 1 (Versova ➔ Ghatkopar)",
            "color": "#3B82F6",
            "stations_count": 12,
            "track_coords": [
                [19.1315, 72.8185], [19.1305, 72.8275], [19.1285, 72.8365], [19.1195, 72.8465],
                [19.1165, 72.8565], [19.1115, 72.8665], [19.1085, 72.8765], [19.1065, 72.8865],
                [19.1030, 72.8905], [19.0965, 72.8995], [19.0915, 72.9035], [19.0865, 72.9085]
            ]
        },
        {
            "id": "mum_line7",
            "name": "Line 7 (Gundavali ➔ Dahisar East)",
            "color": "#EF4444",
            "stations_count": 5,
            "track_coords": [
                [19.1160, 72.8570], [19.1645, 72.8595], [19.1765, 72.8615], [19.2295, 72.8610],
                [19.2565, 72.8640]
            ]
        }
    ],
    "Chennai": [
        {
            "id": "che_blue",
            "name": "Blue Line (Airport ➔ Central)",
            "color": "#3B82F6",
            "stations_count": 8,
            "track_coords": [
                [12.9805, 80.1635], [13.0045, 80.2015], [13.0095, 80.2135], [13.0235, 80.2255],
                [13.0315, 80.2375], [13.0410, 80.2465], [13.0585, 80.2545], [13.0825, 80.2755]
            ]
        },
        {
            "id": "che_green",
            "name": "Green Line (Central ➔ Koyambedu ➔ St. Thomas)",
            "color": "#10B981",
            "stations_count": 10,
            "track_coords": [
                [13.0825, 80.2755], [13.0785, 80.2610], [13.0795, 80.2505], [13.0780, 80.2415],
                [13.0775, 80.2285], [13.0850, 80.2115], [13.0855, 80.1985], [13.0725, 80.1945],
                [13.0515, 80.2110], [13.0365, 80.2115], [13.0045, 80.2015]
            ]
        }
    ],
    "Kolkata": [
        {
            "id": "kol_green",
            "name": "Green Line (Howrah Maidan ➔ Sector V)",
            "color": "#10B981",
            "stations_count": 10,
            "track_coords": [
                [22.5855, 88.3305], [22.5835, 88.3425], [22.5730, 88.3495], [22.5645, 88.3515],
                [22.5675, 88.3715], [22.5715, 88.3885], [22.5710, 88.4035], [22.5875, 88.4095],
                [22.5865, 88.4195], [22.5805, 88.4325]
            ]
        },
        {
            "id": "kol_blue",
            "name": "Blue Line (Dakshineswar ➔ Kalighat)",
            "color": "#3B82F6",
            "stations_count": 5,
            "track_coords": [
                [22.6545, 88.3585], [22.6215, 88.3930], [22.5645, 88.3515], [22.5515, 88.3510],
                [22.5445, 88.3495], [22.5185, 88.3455]
            ]
        }
    ]
}

def generate_station_presets() -> Dict[str, StationPreset]:
    registry: Dict[str, StationPreset] = {}

    for city, stations_list in RAW_CITIES_STATIONS.items():
        for st in stations_list:
            s_id = st["id"]
            name = st["name"]
            lat = st["lat"]
            lng = st["lng"]
            line = st.get("line", "Metro Line")

            # Curbside Bays
            bays = [
                CurbsideBay(
                    bay_id=f"{s_id}_bay_1",
                    station_id=s_id,
                    name=f"Gate 1 – North Concourse Bay A",
                    lat=round(lat + 0.0007, 6),
                    lng=round(lng - 0.0006, 6)
                ),
                CurbsideBay(
                    bay_id=f"{s_id}_bay_2",
                    station_id=s_id,
                    name=f"Gate 2 – Curb Point B",
                    lat=round(lat - 0.0005, 6),
                    lng=round(lng + 0.0007, 6)
                ),
                CurbsideBay(
                    bay_id=f"{s_id}_bay_3",
                    station_id=s_id,
                    name=f"Gate 3 – Feeder Auto Bay C",
                    lat=round(lat + 0.0003, 6),
                    lng=round(lng + 0.0008, 6)
                )
            ]

            # Virtual Corner Stops
            v_stops = [
                VirtualStop(
                    stop_id=f"{s_id}_vstop_1",
                    station_id=s_id,
                    name=f"{name} North Colony Arch",
                    lat=round(lat + 0.0045, 6),
                    lng=round(lng - 0.0035, 6),
                    walking_radius_m=350.0
                ),
                VirtualStop(
                    stop_id=f"{s_id}_vstop_2",
                    station_id=s_id,
                    name=f"{name} Junction Pillar 14",
                    lat=round(lat - 0.0040, 6),
                    lng=round(lng - 0.0045, 6),
                    walking_radius_m=350.0
                ),
                VirtualStop(
                    stop_id=f"{s_id}_vstop_3",
                    station_id=s_id,
                    name=f"{name} East Market Cross",
                    lat=round(lat + 0.0035, 6),
                    lng=round(lng + 0.0055, 6),
                    walking_radius_m=350.0
                ),
                VirtualStop(
                    stop_id=f"{s_id}_vstop_4",
                    station_id=s_id,
                    name=f"{name} South Community Gate",
                    lat=round(lat - 0.0055, 6),
                    lng=round(lng + 0.0030, 6),
                    walking_radius_m=350.0
                )
            ]

            # Destination Corridors
            corridors = [
                Location(
                    lat=round(lat + 0.0085, 6),
                    lng=round(lng + 0.0090, 6),
                    name=f"{name} Cyber Tech Park Bldg 4",
                    address=f"{name} Corridor, {city}"
                ),
                Location(
                    lat=round(lat - 0.0095, 6),
                    lng=round(lng + 0.0110, 6),
                    name=f"{name} Central Commercial Plaza",
                    address=f"High Street, {city}"
                ),
                Location(
                    lat=round(lat + 0.0120, 6),
                    lng=round(lng - 0.0095, 6),
                    name=f"{name} Corporate Towers & SEZ",
                    address=f"Sector Ring Road, {city}"
                ),
                Location(
                    lat=round(lat - 0.0070, 6),
                    lng=round(lng - 0.0125, 6),
                    name=f"{name} Specialty Hospital & Clinic",
                    address=f"Medical Belt, {city}"
                ),
            ]

            # Residential Clusters
            residential = [
                Location(
                    lat=round(lat + 0.0048, 6),
                    lng=round(lng - 0.0038, 6),
                    name=f"{name} Enclave Flat 402",
                    address=f"Colony Block B, {city}"
                ),
                Location(
                    lat=round(lat + 0.0042, 6),
                    lng=round(lng - 0.0032, 6),
                    name=f"{name} Heights Apt 201",
                    address=f"North Enclave, {city}"
                ),
                Location(
                    lat=round(lat - 0.0043, 6),
                    lng=round(lng - 0.0042, 6),
                    name=f"{name} Green Villa 14",
                    address=f"Pillar Lane, {city}"
                ),
                Location(
                    lat=round(lat - 0.0038, 6),
                    lng=round(lng - 0.0048, 6),
                    name=f"{name} Residency 3B",
                    address=f"Junction Road, {city}"
                ),
                Location(
                    lat=round(lat + 0.0038, 6),
                    lng=round(lng + 0.0052, 6),
                    name=f"{name} Teachers Colony 12",
                    address=f"East Cross, {city}"
                ),
            ]

            # Landmark overrides
            if s_id == "raidurg":
                corridors = [
                    Location(lat=17.4428, lng=78.3825, name="Mindspace IT Park Bldg 12", address="Madhapur, Hyderabad"),
                    Location(lat=17.4342, lng=78.3860, name="Knowledge City Cyber Gateway", address="HITEC City, Hyderabad"),
                    Location(lat=17.4485, lng=78.3562, name="DLF CyberCity Gachibowli", address="Gachibowli, Hyderabad"),
                    Location(lat=17.4350, lng=78.3885, name="Inorbit Mall High Street", address="HITEC City, Hyderabad"),
                    Location(lat=17.4382, lng=78.3862, name="My Home Bhooja Towers", address="Knowledge City, Hyderabad"),
                    Location(lat=17.4450, lng=78.3895, name="T-Hub Phase 2 Innovation Center", address="Madhapur, Hyderabad"),
                ]
                v_stops = [
                    VirtualStop(stop_id="r_stop_1", station_id="raidurg", name="Prashant Hills Colony Arch", lat=17.4452, lng=78.3695),
                    VirtualStop(stop_id="r_stop_2", station_id="raidurg", name="Telecom Nagar Community Gate", lat=17.4348, lng=78.3662),
                    VirtualStop(stop_id="r_stop_3", station_id="raidurg", name="Gachibowli Stadium Arch Point", lat=17.4478, lng=78.3610),
                    VirtualStop(stop_id="r_stop_4", station_id="raidurg", name="Diamond Hills Main Entrance", lat=17.4510, lng=78.3745),
                ]

            preset = StationPreset(
                id=s_id,
                name=name,
                city=city,
                line=line,
                lat=lat,
                lng=lng,
                curbside_bays=bays,
                virtual_corner_stops=v_stops,
                popular_corridors=corridors,
                residential_clusters=residential
            )
            registry[s_id] = preset

    return registry

STATIONS_REGISTRY = generate_station_presets()

def get_cities_list() -> List[str]:
    return list(RAW_CITIES_STATIONS.keys())

def get_stations_by_city(city_name: str) -> List[StationPreset]:
    return [s for s in STATIONS_REGISTRY.values() if s.city.lower() == city_name.lower()]

def get_metro_lines_for_city(city_name: str) -> List[Dict]:
    return METRO_LINES_REGISTRY.get(city_name, [])
