import { BentoJsonRpcErrorCodes } from '../../common/utils/error-util';
import { ForbiddenException } from '@nestjs/common';

export const addressChangePermissionDenied = ( rpcResult ) => {
    if ( rpcResult && rpcResult.error && rpcResult.error.length > 0) {
        const errors = rpcResult.error;
        const code = errors[ 0 ].code;
        const message = errors[ 0 ].message;

        if ( code === BentoJsonRpcErrorCodes.PermissionDenied ) {
            const exception = new ForbiddenException(message);
            return exception;
        }
    }
    return undefined;
};