import gql from 'graphql-tag';
import {PredefinedFragments} from '@jahia/data-helper';

export const getCKEditorConfigurationPath = gql`
    query getCKEditorConfigurationPath($nodePath: String!) {
        forms {
            ckeditorConfigPath(nodePath: $nodePath)
            ckeditorToolbar(nodePath: $nodePath)
        }
    }
`;

export const getEditorVersionInfo = gql`
    query getEditorVersionInfo($siteId: String!) {
      jcr {
        nodeById(uuid: $siteId) {
          property(name: "useCkEditor4") {
            booleanValue
          }
          ...NodeCacheRequiredFields
        }
      }
    }
    ${PredefinedFragments.nodeCacheRequiredFields.gql}
`;
