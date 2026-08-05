'use client';

import React, { FC, useCallback, useState } from 'react';
import useSWR from 'swr';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import { useUser } from '@gitroom/frontend/components/layout/user.context';
import { Button } from '@gitroom/react/form/button';
import { Input } from '@gitroom/react/form/input';
import { LoadingComponent } from '@gitroom/frontend/components/layout/loading';

interface WhitelistedEmail {
  id: string;
  email: string;
  createdAt: string;
}

export const AdminWhitelistComponent: FC = () => {
  const fetch = useFetch();
  const user = useUser();
  const [emailInput, setEmailInput] = useState('');
  const [adding, setAdding] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { data, error, mutate, isLoading } = useSWR<WhitelistedEmail[]>(
    '/admin/whitelist',
    async (url: string) => {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error('Failed to load whitelist');
      }
      return res.json();
    },
    {
      revalidateOnFocus: true,
      revalidateOnMount: true,
    }
  );

  const handleAdd = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !emailInput.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setAdding(true);
    setErrorMsg('');

    try {
      const res = await fetch('/admin/whitelist', {
        method: 'POST',
        body: JSON.stringify({ email: emailInput.trim() }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Failed to add email');
      }

      setEmailInput('');
      mutate();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error occurred while adding email.');
    } finally {
      setAdding(false);
    }
  }, [emailInput, fetch, mutate]);

  const handleRemove = useCallback((id: string) => async () => {
    if (!confirm('Are you sure you want to remove this email from the whitelist?')) {
      return;
    }

    try {
      const res = await fetch(`/admin/whitelist/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete email');
      }

      mutate();
    } catch (err: any) {
      alert(err.message || 'Error occurred while deleting email.');
    }
  }, [fetch, mutate]);

  if (!user?.isSuperAdmin) {
    return <div className="text-red-500 p-4">Unauthorized: SuperAdmin privileges required.</div>;
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto p-6 bg-forth border border-customColor6 rounded-[12px] text-textColor">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">User Registration Whitelist</h1>
        <p className="text-sm text-textColor/70">
          When registration is disabled via the environment configuration, only emails listed in this whitelist will be permitted to register new accounts.
        </p>
      </div>

      {/* Add Email Form */}
      <form onSubmit={handleAdd} className="flex flex-col gap-4 p-4 border border-customColor6 rounded-[8px] bg-sixth">
        <h2 className="text-lg font-medium">Authorize New Email</h2>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <Input
              label="Email Address"
              name="email"
              placeholder="user@example.com"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              disableForm={adding}
              removeError={true}
            />
          </div>
          <Button type="submit" loading={adding} className="h-[42px] px-6">
            Authorize
          </Button>
        </div>
        {errorMsg && <div className="text-red-500 text-sm mt-1">{errorMsg}</div>}
      </form>

      {/* Whitelisted Emails Table */}
      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Authorized Whitelist ({data?.length || 0})</h2>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingComponent />
          </div>
        ) : error ? (
          <div className="text-red-500 py-4">Failed to load whitelisted emails.</div>
        ) : !data || data.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-customColor6 rounded-[8px] text-textColor/50">
            No whitelisted emails yet. Anyone will be blocked if registration is disabled.
          </div>
        ) : (
          <div className="border border-customColor6 rounded-[8px] overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-sixth border-b border-customColor6">
                  <th className="p-3 text-sm font-semibold">Email Address</th>
                  <th className="p-3 text-sm font-semibold">Added On</th>
                  <th className="p-3 text-sm font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                  <tr key={item.id} className="border-b border-customColor6 hover:bg-sixth/40">
                    <td className="p-3 text-sm font-medium">{item.email}</td>
                    <td className="p-3 text-sm text-textColor/70">
                      {new Date(item.createdAt).toLocaleString()}
                    </td>
                    <td className="p-3 text-sm text-right">
                      <button
                        onClick={handleRemove(item.id)}
                        className="text-red-500 hover:text-red-700 font-semibold px-2 py-1"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
