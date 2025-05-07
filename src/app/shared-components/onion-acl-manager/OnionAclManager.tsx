import { Checkbox, FormControlLabel, FormGroup, styled } from '@mui/material';
import { useEffect, useState } from 'react';
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import { useTranslation } from 'react-i18next';
import OnionSidebar from '../components/OnionSidebar';


interface AccessRule {
  label: string;
  defaultPermission?: boolean;
}

interface BulkACLCheckBoxState {
  [key: string]: boolean;
}

const OnionAclManager = ({ modules, acl, onUpdate, permissions }) => {
  const { t } = useTranslation('roleManagement');
  const [modulesObject, setModuleObject] = useState({});
  const [aclObject, setAclObject] = useState({});
  const [progress, setProgress] = useState(false);
  const [bulkACLCheckBox, toggleBulkACLCheckBox] = useState<BulkACLCheckBoxState>({});

  const [canBulkSelect, setBulkSelect] = useState({});

  useEffect(() => {
    if (modules.length > 0) {
      let _module = {};
      let _bulkSelectCapableModules = {};
      modules.map((module) => {
        _module[module.moduleKey] = module;
        _bulkSelectCapableModules[module.moduleKey] = false;
        for (const [_mrKey, _mrObject] of Object.entries<AccessRule>(module.accessRules)) {
          if (typeof _mrObject.defaultPermission !== "undefined") {
            _bulkSelectCapableModules[module.moduleKey] = true;
            break;
          }
        }
        setBulkSelect(_bulkSelectCapableModules);
      });
      setModuleObject(_module);
    }
    setAclObject(acl);
  }, [modules, acl])

  useEffect(() => {
    Object.keys(aclObject).length > 0 && Object.entries(aclObject).forEach(([_aclKey, _aclObject]: [_aclKey: string, _aclObject: any]) => {
      isAllAccessRulesChecked(_aclKey);
    });
  }, [aclObject])

  const toggleAclRuleChange = (moduleKey, accessKey, element) => {
    setAclObject((prevAcl) => {
      let _prevAcl = { ...prevAcl };

      if (typeof _prevAcl[moduleKey] === "undefined") {
        _prevAcl[moduleKey] = {};
      }

      if (typeof _prevAcl[moduleKey][accessKey] === "undefined") {
        _prevAcl[moduleKey][accessKey] = {};
      }

      _prevAcl[moduleKey][accessKey].permission = element.target.checked;

      return _prevAcl;
    });
  }

  const toggleALLAclRuleChange = (moduleKey, element) => {
    toggleBulkACLCheckBox((prevState) => {
      let _prevState = { ...prevState };
      _prevState[moduleKey] = element.target.checked;
      return _prevState;
    });
    processSingleCheckboxOnBulkChange(moduleKey, element.target.checked);
  }

  const processSingleCheckboxOnBulkChange = (moduleKey, checked) => {
    const moduleAccessRules = modulesObject[moduleKey].accessRules;
    const _aclObject = { ...aclObject };
    Object.entries(moduleAccessRules).forEach(([acessRuleKey, accessRule]: [acessRuleKey: string, accessRule: any]) => {
      if (typeof accessRule.defaultPermission === "undefined") {

        if (typeof _aclObject[moduleKey] === "undefined") {
          _aclObject[moduleKey] = {};
        }

        if (typeof _aclObject[moduleKey][acessRuleKey] === "undefined") {
          _aclObject[moduleKey][acessRuleKey] = {};
        }

        _aclObject[moduleKey][acessRuleKey].permission = checked;
      }
    });
    setAclObject(_aclObject);
  }

  const isAllAccessRulesChecked = (moduleKey) => {
    if (typeof modulesObject[moduleKey] !== "undefined") {
      toggleBulkACLCheckBox((prevState) => {
        let _prevState = { ...prevState };
        const _moduleAccessRule = modulesObject[moduleKey].accessRules;
        let allChecked = true;
        for (const [_mrKey, _mrObject] of Object.entries(_moduleAccessRule)) {
          if (typeof aclObject[moduleKey][_mrKey] === "undefined" || aclObject[moduleKey][_mrKey].permission === false) {
            allChecked = false;
            break;
          }
        }
        _prevState[moduleKey] = allChecked;
        return _prevState;
      });
    }
  }

  const handleSave = () => {
    setProgress(true);
    onUpdate(aclObject);
  };

  return (
    <>
      <OnionSidebar
        title={t('role_editRoleRolePermissions_title')}
        subTitle={t('role_editRoleRolePermissions_text')}
        exitEndpoint="/admin/settings/user-settings/role-management"
        sidebarWidth='full'
        footer={true}
        footerButtonClick={handleSave}
        footerButtonDisabled={permissions.editRole === true}
        footerButtonLabel={t('role_editForm_confirm')}
        footerButtonSize='medium'
        isFooterButtonLoading={progress}
      >
        <Box sx={{ flexGrow: 1 }}>
          <Grid container spacing={5}>
            {Object.keys(modulesObject).length > 0 && Object.entries(modulesObject).map(([moduleKey, module]: [moduleKey: string, module: any]) => (
              <Grid item xs={12} md={6} sm={12} key={moduleKey}>
                <div className="card text-left border-solid border-1 border-zinc-400 rounded-xl h-full min-h-[250px]">
                  <FormGroup>
                    <div className="card-header border-solid border-b-1 border-zinc-400 py-8 px-16">
                      <FormControlLabel
                        sx={{
                          '& .MuiFormControlLabel-label': {
                            fontWeight: '600',
                            fontSize: '12px',
                          }
                        }}
                        control={
                          <Checkbox className='me-6'
                            sx={{
                              '& svg': {
                                color: (canBulkSelect[moduleKey] === true) ? 
                                !(typeof bulkACLCheckBox[moduleKey] !== "undefined" ? bulkACLCheckBox[moduleKey] : false) && 'text.secondary' : 
                                !(typeof bulkACLCheckBox[moduleKey] !== "undefined" ? bulkACLCheckBox[moduleKey] : false) && 'text.primary',
                              }
                            }}
                            disabled={canBulkSelect[moduleKey] === true}
                            onChange={(e) => toggleALLAclRuleChange(moduleKey, e)}
                            checked={typeof bulkACLCheckBox[moduleKey] !== "undefined" ? bulkACLCheckBox[moduleKey] : false}
                          />
                        }
                        label={module.label}
                      />
                    </div>
                    <div className="card-body p-16 grid grid-cols-2 gap-4">
                      {Object.entries(module.accessRules).map(([accessKey, accessRule]: [string, AccessRule]) => (
                        <div key={accessKey} className="flex items-center">
                          <FormControlLabel
                            sx={{
                              '& .MuiFormControlLabel-label': {
                                fontWeight: '400',
                                fontSize: '12px',
                              }
                            }}
                            control={
                              <Checkbox
                                className='me-6'
                                sx={{
                                  '& svg': {
                                    color: (typeof accessRule.defaultPermission !== "undefined") ? 
                                    !(aclObject?.[moduleKey]?.[accessKey]?.permission === true) && 'text.secondary' : 
                                    !(aclObject?.[moduleKey]?.[accessKey]?.permission === true) && 'text.primary',
                                  }
                                }}
                                checked={aclObject?.[moduleKey]?.[accessKey]?.permission === true}
                                onChange={(e) => toggleAclRuleChange(moduleKey, accessKey, e)}
                                disabled={typeof accessRule.defaultPermission !== "undefined"}
                              />

                            }
                            label={accessRule.label}
                          />
                        </div>
                      ))}
                    </div>
                  </FormGroup>
                </div>
              </Grid>
            ))}
          </Grid>
        </Box>
      </OnionSidebar>
    </>
  );
};

export default OnionAclManager;
