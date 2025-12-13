import React, { useState } from 'react';
import { ResourcePool, CreateVmPayload, CreateCtPayload } from '../types';
import { X, Check, Monitor, Box } from 'lucide-react';

interface CreateWizardProps {
  pools: ResourcePool[];
  onClose: () => void;
  onSubmit: (data: any, type: 'vm' | 'ct') => void;
}

const CreateWizard: React.FC<CreateWizardProps> = ({ pools, onClose, onSubmit }) => {
  const [step, setStep] = useState(0); // 0 = Type Selection
  const [type, setType] = useState<'vm' | 'ct'>('vm');
  
  const [formData, setFormData] = useState({
    vmid: 100 + Math.floor(Math.random() * 100),
    name: '',
    memory: 2048,
    cores: 2,
    storage: 'local-lvm',
    poolid: pools[0]?.poolid || '',
    template: 'local:vztmpl/ubuntu-20.04-standard_20.04-1_amd64.tar.gz'
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isStepValid = () => {
    if (step === 0) return true;
    if (step === 1) return formData.vmid > 0 && formData.name.length > 0;
    if (step === 2) return formData.cores > 0 && formData.memory > 0;
    if (step === 3) return formData.poolid.length > 0 && formData.storage.length > 0;
    return false;
  };

  const handleFinalSubmit = () => {
    const payload = type === 'vm' 
      ? {
          vmid: Number(formData.vmid),
          name: formData.name,
          memory: Number(formData.memory),
          cores: Number(formData.cores),
          storage: formData.storage,
          poolid: formData.poolid
        } as CreateVmPayload
      : {
          vmid: Number(formData.vmid),
          name: formData.name,
          template: formData.template,
          storage: formData.storage,
          poolid: formData.poolid
        } as CreateCtPayload;
    
    onSubmit(payload, type);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">
            Deploy New Service
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Steps Progress */}
        {step > 0 && (
          <div className="px-6 py-4">
            <div className="flex items-center justify-between relative">
               <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 -z-10"></div>
               {[1, 2, 3].map(s => (
                 <div key={s} className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all ${step >= s ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-300 text-gray-400'}`}>
                   {step > s ? <Check size={14} /> : s}
                 </div>
               ))}
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2 px-1">
               <span>Identity</span>
               <span>Compute</span>
               <span>Pool</span>
            </div>
          </div>
        )}

        {/* Form Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          
          {/* Step 0: Type Selection */}
          {step === 0 && (
              <div className="space-y-4 animation-fade-in">
                  <h3 className="text-lg font-medium text-gray-900 text-center mb-6">What would you like to deploy?</h3>
                  <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={() => setType('vm')}
                        className={`p-6 rounded-xl border-2 flex flex-col items-center justify-center space-y-3 transition-all ${type === 'vm' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300 text-gray-600'}`}
                      >
                          <Monitor size={48} className={type === 'vm' ? 'text-blue-600' : 'text-gray-400'} />
                          <span className="font-bold">Virtual Machine</span>
                          <span className="text-xs text-center opacity-70">Full OS virtualization using KVM. Best for isolation.</span>
                      </button>
                      <button 
                        onClick={() => setType('ct')}
                        className={`p-6 rounded-xl border-2 flex flex-col items-center justify-center space-y-3 transition-all ${type === 'ct' ? 'border-violet-600 bg-violet-50 text-violet-700' : 'border-gray-200 hover:border-gray-300 text-gray-600'}`}
                      >
                          <Box size={48} className={type === 'ct' ? 'text-violet-600' : 'text-gray-400'} />
                          <span className="font-bold">Container (LXC)</span>
                          <span className="text-xs text-center opacity-70">Lightweight Linux container. Best for performance.</span>
                      </button>
                  </div>
              </div>
          )}

          {step === 1 && (
            <div className="space-y-4 animation-fade-in">
              <div className="bg-gray-50 p-3 rounded-lg flex items-center mb-4">
                  <span className="text-xs font-semibold uppercase text-gray-500 mr-2">Creating:</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${type === 'vm' ? 'bg-blue-100 text-blue-800' : 'bg-violet-100 text-violet-800'}`}>
                      {type === 'vm' ? 'Virtual Machine' : 'LXC Container'}
                  </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Service ID</label>
                <input 
                  type="number" 
                  value={formData.vmid} 
                  onChange={(e) => handleChange('vmid', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-blue-500 focus:border-blue-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Hostname / Label</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="e.g. web-server-01"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-blue-500 focus:border-blue-500" 
                />
              </div>
              {type === 'ct' && (
                <div>
                   <label className="block text-sm font-medium text-gray-700">OS Template</label>
                   <select
                    value={formData.template}
                    onChange={(e) => handleChange('template', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-sm text-gray-600 bg-white"
                   >
                       <option value="local:vztmpl/ubuntu-20.04-standard_20.04-1_amd64.tar.gz">Ubuntu 20.04 Standard</option>
                       <option value="local:vztmpl/debian-11-standard_11.0-1_amd64.tar.gz">Debian 11 Bullseye</option>
                       <option value="local:vztmpl/alpine-3.15-default_20211202_amd64.tar.gz">Alpine Linux 3.15</option>
                   </select>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animation-fade-in">
              <div>
                <label className="block text-sm font-medium text-gray-700">CPU Cores</label>
                <div className="flex items-center space-x-4 mt-1">
                    <input 
                    type="range" 
                    min="1" max="8"
                    value={formData.cores} 
                    onChange={(e) => handleChange('cores', e.target.value)}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="font-bold text-lg w-12 text-center">{formData.cores}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Memory Allocation (MB)</label>
                <input 
                  type="number" 
                  value={formData.memory} 
                  onChange={(e) => handleChange('memory', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-blue-500 focus:border-blue-500" 
                />
                <div className="grid grid-cols-4 gap-2 mt-2">
                   {[512, 1024, 2048, 4096].map(mem => (
                       <button 
                            key={mem}
                            onClick={() => handleChange('memory', mem)} 
                            className={`text-xs px-2 py-1 rounded border ${formData.memory == mem ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                        >
                           {mem >= 1024 ? `${mem/1024}GB` : `${mem}MB`}
                        </button>
                   ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animation-fade-in">
              <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                <p className="text-sm text-yellow-800 font-medium">Pool Assignment</p>
                <p className="text-xs text-yellow-700 mt-1">
                   Service will be billed to the selected workspace.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Workspace / Pool</label>
                <select 
                   value={formData.poolid} 
                   onChange={(e) => handleChange('poolid', e.target.value)}
                   className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="">Select a Pool...</option>
                  {pools.map(p => (
                    <option key={p.poolid} value={p.poolid}>{p.poolid}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Primary Storage</label>
                <select 
                   value={formData.storage} 
                   onChange={(e) => handleChange('storage', e.target.value)}
                   className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="local-lvm">local-lvm (Fast SSD)</option>
                  <option value="ceph">Ceph (Distributed)</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between">
          <button 
            onClick={() => setStep(s => Math.max(0, s - 1))}
            disabled={step === 0}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Back
          </button>
          
          {step < 3 ? (
            <button 
              onClick={() => setStep(s => Math.min(3, s + 1))}
              disabled={!isStepValid()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {step === 0 ? 'Start Configuration' : 'Next Step'}
            </button>
          ) : (
             <button 
               onClick={handleFinalSubmit}
               disabled={!isStepValid()}
               className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 shadow-md disabled:opacity-50 transition-colors"
             >
               Deploy Service
             </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateWizard;