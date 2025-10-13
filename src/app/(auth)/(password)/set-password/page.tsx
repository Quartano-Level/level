'use client'

import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/shared/components/ui/card'
import Image from 'next/image'
import { useSetPassword } from '@/features/auth/hooks/useSetPassword'
import { FormInput } from '@/shared/components/ui/form-input'

export default function SetPassword() {
    const {
        password,
        confirmPassword,
        handlePasswordChange,
        handleConfirmPasswordChange,
        loading,
        error,
        formErrors,
        success,
        handleSetPassword
    } = useSetPassword()

    // Determina se os inputs devem ser desabilitados
    const inputsDisabled = loading || Boolean(error)

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
            <div className="mb-8">
                <Image
                    src="/logo.svg"
                    alt="Logo Superia"
                    width={160}
                    height={40}
                    priority
                />
            </div>
            
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">Definir Senha</CardTitle>
                    <CardDescription className="text-center">
                        Crie uma senha para finalizar seu cadastro
                    </CardDescription>
                </CardHeader>
                
                <CardContent>
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
                            {error}
                        </div>
                    )}
                    
                    {success ? (
                        <div className="bg-green-50 text-green-600 p-3 rounded-md mb-4 text-center">
                            Senha definida com sucesso! Redirecionando para o dashboard...
                        </div>
                    ) : (
                        <form onSubmit={handleSetPassword}>
                            <div className="space-y-2">
                                <FormInput
                                    label="Nova senha"
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={handlePasswordChange}
                                    required
                                    placeholder="Digite sua nova senha"
                                    error={formErrors?.password}
                                    disabled={inputsDisabled}
                                    className={inputsDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                                />
                                
                                <FormInput
                                    label="Confirmar senha"
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={handleConfirmPasswordChange}
                                    required
                                    placeholder="Confirme sua nova senha"
                                    error={formErrors?.confirmPassword}
                                    disabled={inputsDisabled}
                                    className={inputsDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                                />
                                
                                <Button 
                                    type="submit" 
                                    className="w-full bg-primary text-white"
                                    disabled={loading || Boolean(error) || Object.keys(formErrors).length > 0}
                                >
                                    {loading ? "Processando..." : "Definir senha"}
                                </Button>
                            </div>
                        </form>
                    )}
                </CardContent>
                
                <CardFooter className="flex justify-center text-sm text-gray-500">
                    Ao definir sua senha, você concorda com os Termos de Serviço.
                </CardFooter>
            </Card>
        </div>
    )
} 