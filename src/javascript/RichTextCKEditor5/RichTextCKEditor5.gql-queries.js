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
