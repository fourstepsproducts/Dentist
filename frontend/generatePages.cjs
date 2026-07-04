const fs = require('fs');
const path = require('path');

const pages = [
  'PatientRecords',
  'ChiefComplaint',
  'DiagnosisTreatment',
  'TreatmentRecords',
  'Appointments',
  'Documents',
  'Profile',
  'Settings'
];

const dir = path.join(__dirname, 'src', 'pages', 'clinic', 'pages');
fs.mkdirSync(dir, { recursive: true });

pages.forEach(page => {
  const title = page.replace(/([A-Z])/g, ' $1').trim();
  const content = `import React from 'react';
import { Card } from '../../../components/ui/Card';

const ${page} = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">${title}</h1>
        <p className="text-slate-500 text-sm mt-1">Clinic Portal / ${title}</p>
      </div>

      <Card>
        <div className="p-8 text-center text-slate-500">
          <p className="text-lg font-medium">${title} Module</p>
          <p className="mt-2">This module is currently under construction.</p>
        </div>
      </Card>
    </div>
  );
};

export default ${page};
`;
  fs.writeFileSync(path.join(dir, `${page}.jsx`), content);
});

console.log('Pages created successfully.');
