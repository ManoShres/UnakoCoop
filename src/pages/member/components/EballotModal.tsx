import React from 'react';
import { BadgeCheck, BellRing, CheckCircle2, Fingerprint, Grip, Lock, Pencil, Shield, ShieldCheck, Sun, Timer, Vote, X } from 'lucide-react';
import { useLanguageStore } from '../../../store/useLanguageStore';

interface EballotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export function EballotModal({ isOpen, onClose, onSubmit }: EballotModalProps) {
  const { t } = useLanguageStore();

  if (!isOpen) return null;

  return (
    <div onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}>
        <div className="fixed inset-0 z-50 overflow-y-auto bg-surface-dark/80 backdrop-blur-sm flex items-center justify-center p-space-sm sm:p-space-md lg:p-space-lg" id="e-ballot-modal">
          <div className="relative w-full max-w-4xl bg-surface-card rounded-2xl shadow-2xl overflow-hidden my-space-md border-t-4 border-primary flex flex-col max-h-[92vh]">
            <div className="bg-surface-dark text-surface-canvas p-space-lg flex items-start justify-between gap-space-md">
              <div className="space-y-space-xs">
                <div className="flex flex-wrap items-center gap-space-xs">
                  <span className="bg-brand-accent-lime/20 text-brand-accent-lime font-label-sm text-label-sm px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5" /> {t('गोप्य विद्युतीय मतपत्र', 'E-Ballot (Secret Digital Ballot)')}
                  </span>
                  <span className="bg-surface-dark-card text-slate-300 font-tabular-mono text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Timer className="w-3.5 h-3.5 text-status-warning" /> {t('मतदान बन्द हुन बाँकी: ०४ घण्टा ३२ मिनेट', 'Polls close in: 04h 32m')}
                  </span>
                </div>
                <h2 className="font-headline-md text-headline-md font-bold text-surface-canvas tracking-tight">
                  {t('३१औं साधारण सभा: विद्युतीय गोप्य मतदान प्रणाली', '31st AGM Digital Secret Ballot System')}
                </h2>
                <p className="font-label-sm text-label-sm text-slate-300 flex items-center gap-1 flex-wrap">
                  <span className="text-brand-accent-lime font-bold">{t('मतदान योग्य सदस्य:', 'Eligible Voter:')}</span>
                  <span>{t('श्री हरि प्रसाद चौधरी', 'Hari Prasad Chaudhary')} (UKO-2070-08842)</span>
                  <span className="text-slate-400">•</span>
                  <span>{t('१ सदस्य १ मत', '1 Member 1 Vote')}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-300 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-status-success" /> {t('गोप्य इन्क्रिप्टेड मतपत्र', 'End-to-End Encrypted')}
                  </span>
                </p>
              </div>
              <button onClick={onClose} className="p-space-xs rounded-full hover:bg-surface-dark-card text-slate-400 hover:text-surface-canvas transition-colors flex items-center justify-center">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="overflow-y-auto p-space-lg md:p-space-xl space-y-space-xl flex-1 bg-surface-canvas">
              <div className="bg-brand-accent-light p-space-md rounded-xl flex items-center gap-space-sm text-primary">
                <Vote className="w-6 h-6 text-primary flex-shrink-0" />
                <p className="text-xs md:text-sm font-medium leading-relaxed">
                  <strong className="text-primary">{t('सदस्य निर्देशन:', 'Member Instruction:')}</strong> {t('तलका प्रत्येक पदमा आफूले रोजेको उम्मेदवार छनोट गर्नुहोस्। छनोट सम्पन्न भएपछि पृष्ठको अन्त्यमा रहेको सुरक्षा पिन वा बायोमेट्रिक सुरक्षा कोड प्रविष्ट गरी मतदान सुरक्षित गर्नुहोस्।', 'Select your preferred candidate for each post below. Once selected, enter your MPIN or biometric code at the bottom to submit your secure vote.')}
                </p>
              </div>
              <section className="bg-surface-card p-space-lg rounded-xl shadow-sm space-y-space-md">
                <div className="flex items-center justify-between border-b border-surface-container pb-space-xs">
                  <div>
                    <span className="bg-primary text-on-primary font-label-sm text-label-sm px-2 py-0.5 rounded-md font-bold">{t('पद १', 'Post 1')}</span>
                    <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mt-1">{t('अध्यक्ष पद (१ जना रोज्नुहोस्)', 'Chairperson (Select 1)')}</h3>
                  </div>
                  <span className="font-label-sm text-label-sm text-status-success font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> {t('१ छानियो', '1 Selected')}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                  <label className="relative flex items-center p-space-md rounded-xl bg-brand-accent-light border-2 border-primary cursor-pointer transition-all">
                    <input defaultChecked={true} className="w-5 h-5 text-primary focus:ring-primary mr-space-md" name="chairperson" type="radio"/>
                    <div className="flex items-center gap-space-sm flex-1">
                      <img alt="राम बहादुर थारु" className="w-12 h-12 rounded-full object-cover shadow-sm" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCAYVlYbC_Ij0IQV9PPvC5_y4Y2hvScpL30FmKh_NvdjIeEpD4DU_k-enAZaGLgCJlH4QCAxQ6_M4lRJn_7Rq60txTT3kNE1QWe-D1p1LQ1e5XMalbR4JaVWAdQ-yl2NON2mySVY9QiLGU6lA5MvCmqpXCTwHtlPPxzmvcFFdFUZwKutYF9xk36jNVYn8CmeLg1_ZdHSd1mIdJiGtthrmspWGUp68WFY1utnfyPKe4vct-p-DGlelf-"/>
                      <div>
                        <div className="flex items-center gap-space-xs">
                          <h4 className="font-label-md text-label-md font-bold text-on-surface">{t('राम बहादुर थारु', 'Ram Bahadur Tharu')}</h4>
                          <span className="bg-primary text-on-primary text-[10px] px-1.5 py-0.5 rounded font-bold">{t('प्यानल A', 'Panel A')}</span>
                        </div>
                        <p className="text-xs text-on-surface-variant mt-0.5">{t('चुनाव चिन्ह:', 'Election Symbol:')} <strong className="text-primary">{t('धानको बाला', 'Paddy Ear')}</strong></p>
                        <p className="text-xs text-on-surface-variant">{t('गढवा गाउँपालिका-५, दाङ', 'Gadhwa RM-5, Dang')}</p>
                      </div>
                    </div>
                    <Grip className="w-5 h-5 text-primary" />
                  </label>
                  <label className="relative flex items-center p-space-md rounded-xl bg-surface-canvas hover:bg-surface-container border-2 border-transparent cursor-pointer transition-all">
                    <input className="w-5 h-5 text-primary focus:ring-primary mr-space-md" name="chairperson" type="radio"/>
                    <div className="flex items-center gap-space-sm flex-1">
                      <div className="w-12 h-12 rounded-full bg-surface-container-high text-primary flex items-center justify-center font-bold text-base">लो.ना.</div>
                      <div>
                        <div className="flex items-center gap-space-xs">
                          <h4 className="font-label-md text-label-md font-bold text-on-surface">{t('लोक नारायण श्रेष्ठ', 'Lok Narayan Shrestha')}</h4>
                          <span className="bg-surface-container text-on-surface-variant text-[10px] px-1.5 py-0.5 rounded font-bold">{t('प्यानल B', 'Panel B')}</span>
                        </div>
                        <p className="text-xs text-on-surface-variant mt-0.5">{t('चुनाव चिन्ह:', 'Election Symbol:')} <strong className="text-on-surface">{t('सूर्यमुखी फूल', 'Sunflower')}</strong></p>
                        <p className="text-xs text-on-surface-variant">{t('लमही नगरपालिका-२, दाङ', 'Lamahi Municipality-2, Dang')}</p>
                      </div>
                    </div>
                    <Sun className="w-5 h-5 text-status-warning" />
                  </label>
                </div>
              </section>
              <section className="bg-surface-card p-space-lg rounded-xl shadow-sm space-y-space-md">
                <div className="flex items-center justify-between border-b border-surface-container pb-space-xs">
                  <div>
                    <span className="bg-primary text-on-primary font-label-sm text-label-sm px-2 py-0.5 rounded-md font-bold">{t('पद २', 'Post 2')}</span>
                    <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mt-1">{t('उपाध्यक्ष पद (१ जना रोज्नुहोस्)', 'Vice-Chairperson (Select 1)')}</h3>
                  </div>
                  <span className="font-label-sm text-label-sm text-status-success font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> {t('१ छानियो', '1 Selected')}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                  <label className="relative flex items-center p-space-md rounded-xl bg-brand-accent-light border-2 border-primary cursor-pointer transition-all">
                    <input defaultChecked={true} className="w-5 h-5 text-primary focus:ring-primary mr-space-md" name="vice_chairperson" type="radio"/>
                    <div className="flex items-center gap-space-sm flex-1">
                      <img alt="शान्ता चौधरी" className="w-12 h-12 rounded-full object-cover shadow-sm" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA63_qpOWStcsD95zQr5ygKenzK_VIYMNl6e5p4nIxn5WhUsLN-3ZDXgb6y0Yl9PKmCDbF91JjHUiRk11ltzaavZtQO9nQNvCJeIcUr-HHAKY7RMr7eevhovHWWnkFfY0_9pTyy21nLYJyimXd_eVqFoAjLg5aHk4GJJZhEgpsd3JOlUwA4YzwSK_goep3HosmB5Ba7X985Wm0UWnFbUjhfX1RoBhJQwwFZespsJrGHpcOM3gTjjH3-"/>
                      <div>
                        <div className="flex items-center gap-space-xs">
                          <h4 className="font-label-md text-label-md font-bold text-on-surface">{t('शान्ता चौधरी', 'Shanta Chaudhary')}</h4>
                          <span className="bg-surface-container text-on-surface-variant text-[10px] px-1.5 py-0.5 rounded font-bold">{t('प्यानल B', 'Panel B')}</span>
                        </div>
                        <p className="text-xs text-on-surface-variant mt-0.5">{t('चुनाव चिन्ह:', 'Election Symbol:')} <strong className="text-primary">{t('कलम', 'Pen')}</strong></p>
                        <p className="text-xs text-on-surface-variant">{t('चैनपुर, गढवा-५', 'Chainpur, Gadhwa-5')}</p>
                      </div>
                    </div>
                    <Pencil className="w-5 h-5 text-primary" />
                  </label>
                  <label className="relative flex items-center p-space-md rounded-xl bg-surface-canvas hover:bg-surface-container border-2 border-transparent cursor-pointer transition-all">
                    <input className="w-5 h-5 text-primary focus:ring-primary mr-space-md" name="vice_chairperson" type="radio"/>
                    <div className="flex items-center gap-space-sm flex-1">
                      <div className="w-12 h-12 rounded-full bg-surface-container-high text-primary flex items-center justify-center font-bold text-base">गी.श.</div>
                      <div>
                        <div className="flex items-center gap-space-xs">
                          <h4 className="font-label-md text-label-md font-bold text-on-surface">{t('गीता कुमारी शर्मा', 'Geeta Kumari Sharma')}</h4>
                          <span className="bg-primary text-on-primary text-[10px] px-1.5 py-0.5 rounded font-bold">{t('प्यानल A', 'Panel A')}</span>
                        </div>
                        <p className="text-xs text-on-surface-variant mt-0.5">{t('चुनाव चिन्ह:', 'Election Symbol:')} <strong className="text-on-surface">{t('घण्टी', 'Bell')}</strong></p>
                        <p className="text-xs text-on-surface-variant">{t('गोबरगढ, गढवा-१', 'Gobarghada, Gadhwa-1')}</p>
                      </div>
                    </div>
                    <BellRing className="w-5 h-5 text-slate-500" />
                  </label>
                </div>
              </section>
              <section className="bg-surface-card p-space-lg rounded-xl shadow-sm space-y-space-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs border-b border-surface-container pb-space-xs">
                  <div>
                    <span className="bg-surface-container text-on-surface-variant font-label-sm text-label-sm px-2 py-0.5 rounded-md font-bold">{t('पद ३', 'Post 3')}</span>
                    <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mt-1">{t('सञ्चालक समिति सदस्य (७ पद / बढीमा ७ जना रोज्नुहोस्)', 'Board of Directors (7 Seats / Select up to 7)')}</h3>
                  </div>
                  <span className="font-label-sm text-label-sm text-primary font-bold bg-brand-accent-light px-2.5 py-1 rounded-full">{t('४/७ छानिएको', '4 of 7 Selected')}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
                  <label className="flex items-center p-space-sm bg-brand-accent-light border border-primary rounded-xl cursor-pointer">
                    <input defaultChecked={true} className="w-5 h-5 rounded text-primary focus:ring-primary mr-space-sm" type="checkbox"/>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h5 className="font-label-md text-label-md font-bold text-on-surface">{t('चेत नारायण थारु', 'Chet Narayan Tharu')}</h5>
                        <span className="text-[10px] bg-primary text-on-primary px-1.5 py-0.5 rounded font-semibold">{t('खुला कोटा', 'Open Quota')}</span>
                      </div>
                      <p className="text-xs text-on-surface-variant">{t('गढवा-५ • चिन्ह: रुख', 'Gadhwa-5 • Symbol: Tree')}</p>
                    </div>
                  </label>
                  <label className="flex items-center p-space-sm bg-brand-accent-light border border-primary rounded-xl cursor-pointer">
                    <input defaultChecked={true} className="w-5 h-5 rounded text-primary focus:ring-primary mr-space-sm" type="checkbox"/>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h5 className="font-label-md text-label-md font-bold text-on-surface">{t('विमला कुमारी यादव', 'Bimala Kumari Yadav')}</h5>
                        <span className="text-[10px] bg-status-success text-on-primary px-1.5 py-0.5 rounded font-semibold">{t('महिला कोटा', 'Women Quota')}</span>
                      </div>
                      <p className="text-xs text-on-surface-variant">{t('गढवा-३ • चिन्ह: तारा', 'Gadhwa-3 • Symbol: Star')}</p>
                    </div>
                  </label>
                  <label className="flex items-center p-space-sm bg-brand-accent-light border border-primary rounded-xl cursor-pointer">
                    <input defaultChecked={true} className="w-5 h-5 rounded text-primary focus:ring-primary mr-space-sm" type="checkbox"/>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h5 className="font-label-md text-label-md font-bold text-on-surface">{t('डिल्लीराज पोखरेल', 'Dilliraj Pokharel')}</h5>
                        <span className="text-[10px] bg-primary text-on-primary px-1.5 py-0.5 rounded font-semibold">{t('खुला कोटा', 'Open Quota')}</span>
                      </div>
                      <p className="text-xs text-on-surface-variant">{t('गढवा-२ • चिन्ह: माछा', 'Gadhwa-2 • Symbol: Fish')}</p>
                    </div>
                  </label>
                  <label className="flex items-center p-space-sm bg-brand-accent-light border border-primary rounded-xl cursor-pointer">
                    <input defaultChecked={true} className="w-5 h-5 rounded text-primary focus:ring-primary mr-space-sm" type="checkbox"/>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h5 className="font-label-md text-label-md font-bold text-on-surface">{t('सुनिता घर्ती', 'Sunita Gharti')}</h5>
                        <span className="text-[10px] bg-status-success text-on-primary px-1.5 py-0.5 rounded font-semibold">{t('महिला कोटा', 'Women Quota')}</span>
                      </div>
                      <p className="text-xs text-on-surface-variant">{t('गढवा-४ • चिन्ह: गाग्री', 'Gadhwa-4 • Symbol: Water Pot')}</p>
                    </div>
                  </label>
                  <label className="flex items-center p-space-sm bg-surface-canvas hover:bg-surface-container border border-transparent rounded-xl cursor-pointer">
                    <input className="w-5 h-5 rounded text-primary focus:ring-primary mr-space-sm" type="checkbox"/>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h5 className="font-label-md text-label-md font-bold text-on-surface">{t('टेक बहादुर पुन', 'Tek Bahadur Pun')}</h5>
                        <span className="text-[10px] bg-surface-container text-on-surface-variant px-1.5 py-0.5 rounded font-semibold">{t('जनजाति कोटा', 'Indigenous Quota')}</span>
                      </div>
                      <p className="text-xs text-on-surface-variant">{t('राजपुर-१ • चिन्ह: छाता', 'Rajpur-1 • Symbol: Umbrella')}</p>
                    </div>
                  </label>
                  <label className="flex items-center p-space-sm bg-surface-canvas hover:bg-surface-container border border-transparent rounded-xl cursor-pointer">
                    <input className="w-5 h-5 rounded text-primary focus:ring-primary mr-space-sm" type="checkbox"/>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h5 className="font-label-md text-label-md font-bold text-on-surface">{t('महेन्द्र कुमार चौधरी', 'Mahendra Kumar Chaudhary')}</h5>
                        <span className="text-[10px] bg-surface-container text-on-surface-variant px-1.5 py-0.5 rounded font-semibold">{t('खुला कोटा', 'Open Quota')}</span>
                      </div>
                      <p className="text-xs text-on-surface-variant">{t('गढवा-६ • चिन्ह: साइकल', 'Gadhwa-6 • Symbol: Bicycle')}</p>
                    </div>
                  </label>
                </div>
              </section>
              <section className="bg-surface-card p-space-lg rounded-xl shadow-sm space-y-space-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs border-b border-surface-container pb-space-xs">
                  <div>
                    <span className="bg-surface-container text-on-surface-variant font-label-sm text-label-sm px-2 py-0.5 rounded-md font-bold">{t('पद ४', 'Post 4')}</span>
                    <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mt-1">{t('लेखा सुपरिवेक्षण समिति (संयोजक सहित ३ पद)', 'Internal Audit Committee (3 Seats including Coordinator)')}</h3>
                  </div>
                  <span className="font-label-sm text-label-sm text-primary font-bold bg-brand-accent-light px-2.5 py-1 rounded-full">{t('३/३ छानिएको', '3 of 3 Selected')}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm">
                  <label className="p-space-sm bg-brand-accent-light border border-primary rounded-xl flex items-start gap-space-xs cursor-pointer">
                    <input defaultChecked={true} className="w-5 h-5 rounded text-primary focus:ring-primary mt-1" type="checkbox"/>
                    <div>
                      <h5 className="font-label-md text-label-md font-bold text-on-surface">{t('अर्जुन प्रसाद भुसाल', 'Arjun Prasad Bhusal')}</h5>
                      <span className="text-[10px] text-primary font-bold block">{t('संयोजक उम्मेदवार (एम.कम / अडिट अनुभव)', 'Coordinator Candidate (M.Com / Audit Exp)')}</span>
                      <p className="text-xs text-on-surface-variant mt-0.5">{t('चिन्ह: तराजु', 'Symbol: Scale')}</p>
                    </div>
                  </label>
                  <label className="p-space-sm bg-brand-accent-light border border-primary rounded-xl flex items-start gap-space-xs cursor-pointer">
                    <input defaultChecked={true} className="w-5 h-5 rounded text-primary focus:ring-primary mt-1" type="checkbox"/>
                    <div>
                      <h5 className="font-label-md text-label-md font-bold text-on-surface">{t('कमला भण्डारी', 'Kamala Bhandari')}</h5>
                      <span className="text-[10px] text-primary font-bold block">{t('सदस्य (बिबिएस लेखा)', 'Member (BBS Accountancy)')}</span>
                      <p className="text-xs text-on-surface-variant mt-0.5">{t('चिन्ह: किताब', 'Symbol: Book')}</p>
                    </div>
                  </label>
                  <label className="p-space-sm bg-brand-accent-light border border-primary rounded-xl flex items-start gap-space-xs cursor-pointer">
                    <input defaultChecked={true} className="w-5 h-5 rounded text-primary focus:ring-primary mt-1" type="checkbox"/>
                    <div>
                      <h5 className="font-label-md text-label-md font-bold text-on-surface">{t('राजेश कुमार गुप्ता', 'Rajesh Kumar Gupta')}</h5>
                      <span className="text-[10px] text-primary font-bold block">{t('सदस्य (सिए इन्टर)', 'Member (CA Inter / 5 yr exp)')}</span>
                      <p className="text-xs text-on-surface-variant mt-0.5">{t('चिन्ह: कलम', 'Symbol: Pen')}</p>
                    </div>
                  </label>
                </div>
              </section>
              <section className="bg-surface-card p-space-lg rounded-xl shadow-sm border border-primary/20 space-y-space-md">
                <div className="flex items-center gap-space-sm">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Fingerprint className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-headline-sm text-headline-sm font-bold text-on-surface">{t('सुरक्षा पिन / बायोमेट्रिक प्रमाणीकरण', 'MPIN / Biometric Verification')}</h4>
                    <p className="text-xs text-on-surface-variant">{t('सहकारी ४-अङ्कको गोप्य पिन वा औंठाछाप प्रमाणीकरण गर्नुहोस्', 'Enter 4-digit cooperative MPIN or verify fingerprint')}</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-space-md pt-space-xs">
                  <div className="flex items-center gap-space-sm">
                    <input className="w-12 h-12 text-center text-xl font-bold bg-surface-canvas rounded-xl focus:ring-2 focus:ring-primary focus:outline-none" maxLength={1} type="password" value="4" readOnly/>
                    <input className="w-12 h-12 text-center text-xl font-bold bg-surface-canvas rounded-xl focus:ring-2 focus:ring-primary focus:outline-none" maxLength={1} type="password" value="8" readOnly/>
                    <input className="w-12 h-12 text-center text-xl font-bold bg-surface-canvas rounded-xl focus:ring-2 focus:ring-primary focus:outline-none" maxLength={1} type="password" value="2" readOnly/>
                    <input className="w-12 h-12 text-center text-xl font-bold bg-surface-canvas rounded-xl focus:ring-2 focus:ring-primary focus:outline-none" maxLength={1} type="password" value="9" readOnly/>
                  </div>
                  <div className="flex items-center gap-space-sm text-xs text-status-success font-semibold">
                    <BadgeCheck className="w-5 h-5" />
                    <span>{t('बायोमेट्रिक टोकन प्रमाणित (#SEC-BIO-8842)', 'Biometric Token Verified (#SEC-BIO-8842)')}</span>
                  </div>
                </div>
                <div className="p-space-sm bg-surface-container-low rounded-lg text-xs text-on-surface-variant flex items-start gap-space-xs">
                  <Shield className="w-4.5 h-4.5 text-primary flex-shrink-0" />
                  <p><strong>{t('वैधानिक गोपनीयता सूचना:', 'Statutory Privacy Notice:')}</strong> {t('सहकारी ऐन २०७४ तथा संस्थाको निर्वाचन निर्देशिका अनुसार तपाईंको मतदान पूर्ण रूपमा इन्क्रिप्टेड छ र कसैले पनि तपाईंले कुन उम्मेदवारलाई मत दिनुभयो भनी हेर्न वा खोतल्न सक्नेछैन।', 'Under Cooperative Act 2074 and election bylaws, your vote is fully encrypted end-to-end.')}</p>
                </div>
              </section>
            </div>
            <div className="bg-surface-card p-space-lg border-t border-surface-container flex flex-col sm:flex-row items-center justify-between gap-space-md">
              <div className="flex items-center gap-space-xs text-xs text-on-surface-variant">
                <Timer className="w-4 h-4 text-status-success" />
                <span>{t('डिजिटल हस्ताक्षर सुरक्षित गरिएको छ • IP: 103.141.***.***', 'Digital Signature Secured • IP: 103.141.***.***')}</span>
              </div>
              <div className="flex items-center gap-space-sm w-full sm:w-auto">
                <button onClick={onClose} className="w-1/2 sm:w-auto px-space-lg py-space-sm rounded-xl font-label-md text-label-md font-semibold text-on-surface-variant hover:bg-surface-container transition-all">
                  {t('रद्द गर्नुहोस्', 'Cancel')}
                </button>
                <button onClick={onSubmit} className="w-1/2 sm:w-auto px-space-xl py-space-sm rounded-xl font-label-md text-label-md font-bold bg-primary hover:bg-primary-container text-on-primary transition-all shadow-md flex items-center justify-center gap-space-xs">
                  <Vote className="w-5 h-5" />
                  <span>{t('गोप्य मतदान पुष्टि गर्नुहोस्', 'Cast Secret Ballot')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
